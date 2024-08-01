import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, Image, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { formatImageName, importImage, useWindowWidth } from '../components/utils';
import { setAttractions, setRawRideData, setFilteredRideData, setSearchTerm, toggleFavorite } from "../redux/actions/actions";
import Navbar from "../components/Navbar";
import BottomNav from "../components/mobileNavbar";
import AttractionsMap from "../components/AttractionsMap";
import AttractionModal from '../components/ModalAttractions';
import { Picker } from '@react-native-picker/picker';
import { Switch } from 'react-native';
import { createSelector } from 'reselect';
import * as Notifications from 'expo-notifications';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {attractionImages, getFilteredRideData, getRawRideData, getFilters, getSearchTerm} from '../components/utils';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const AttractionsScreen = () => {
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const rawRideData = useSelector(getRawRideData);
    const searchTerm = useSelector(getSearchTerm);
    const favorites = useSelector(state => state.favorites.favorites);
    const filters = useSelector(getFilters);
    const filteredRideData = useSelector(getFilteredRideData);
    const [viewMode, setViewMode] = useState('list');
    const [lastUpdate, setLastUpdate] = useState(null);
    const [previousWaitTimes, setPreviousWaitTimes] = useState({});
    const [changeTimestamps, setChangeTimestamps] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [filtersModalVisible, setFiltersModalVisible] = useState(false);
    const width = useWindowWidth();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        const registerForPushNotificationsAsync = async () => {
            try {
                const { status } = await Notifications.getPermissionsAsync();
                if (status !== 'granted') {
                    const finalStatus = await Notifications.requestPermissionsAsync();
                    if (finalStatus.status !== 'granted') {
                        alert('Vous devez autoriser les notifications pour cette application.');
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la demande de permissions de notification:', error);
            }
        };

        registerForPushNotificationsAsync();

        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification reçue:', notification);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
        };
    }, []);

    const sendWaitTimeChangeNotification = async (rideName, previousWaitTime, currentWaitTime) => {
        if (previousWaitTime !== currentWaitTime) {
            const direction = currentWaitTime > previousWaitTime ? 'augmenté' : 'diminué';
            const message = `Le temps d'attente pour ${rideName} a ${direction} à ${currentWaitTime} minutes.`;

            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Changement de temps d\'attente',
                        body: message,
                        sound: true,
                    },
                    trigger: null,
                });
            } catch (error) {
                console.error('Erreur lors de l\'envoi de la notification:', error);
            }
        }
    };

    const fetchData = useCallback(async () => {
        try {
            const cachedData = await AsyncStorage.getItem('attractionsData');
            const cachedWaitTimes = await AsyncStorage.getItem('waitTimes');
            let parsedData, parsedWaitTimes;

            if (cachedData) {
                parsedData = JSON.parse(cachedData);
                dispatch(setRawRideData(parsedData));
                dispatch(setAttractions(parsedData));
            }

            if (cachedWaitTimes) {
                parsedWaitTimes = JSON.parse(cachedWaitTimes);
                setPreviousWaitTimes(parsedWaitTimes);
            }

            const response = await axios.get('https://eurojourney.azurewebsites.net/api/attractions');
            const rideData = response.data;

            await AsyncStorage.setItem('attractionsData', JSON.stringify(rideData));

            const newPreviousWaitTimes = {};
            rideData.forEach(ride => {
                const prevWaitTime = previousWaitTimes[ride._id]?.currentWaitTime;
                newPreviousWaitTimes[ride._id] = {
                    currentWaitTime: ride.waitTime,
                    previousWaitTime: prevWaitTime || null,
                    hadPreviousWaitTime: !!prevWaitTime
                };

                if (prevWaitTime !== ride.waitTime) {
                    setChangeTimestamps(prevTimestamps => ({
                        ...prevTimestamps,
                        [ride._id]: new Date().getTime()
                    }));
                    sendWaitTimeChangeNotification(ride.name, prevWaitTime, ride.waitTime);
                }
            });

            setPreviousWaitTimes(newPreviousWaitTimes);
            await AsyncStorage.setItem('waitTimes', JSON.stringify(newPreviousWaitTimes));

            setLastUpdate(new Date());
            dispatch(setRawRideData(rideData));
            dispatch(setAttractions(rideData));
        } catch (error) {
            console.error('Erreur lors de la récupération des attractions:', error);
            setError(error);
        }
        if (error) {
            return (
                <View style={styles.container}>
                    <Text style={styles.errorMessage}>Une erreur est survenue : {error.message}</Text>
                </View>
            );
        }
    }, [dispatch, previousWaitTimes]);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 60000); // Toutes les minutes
        return () => clearInterval(intervalId);
    }, [fetchData]);

    useEffect(() => {
        if (rawRideData) {
            dispatch(setFilteredRideData(filteredRideData));
        }
    }, [rawRideData, searchTerm, filters, dispatch, filteredRideData]);

    const handleFilterChange = (filter, value) => {
        dispatch({ type: 'SET_FILTER', payload: { filter, value } });
    };

    const handleSearchChange = (text) => {
        dispatch(setSearchTerm(text));
    };

    const handleToggleFavorite = async (attractionId) => {
        if (attractionId) {
            dispatch(toggleFavorite(attractionId));

            const attraction = rawRideData.find(ride => ride._id === attractionId);
            const message = attraction
                ? `${attraction.name} a été ajouté à vos favoris!`
                : "Attraction ajoutée à vos favoris!";

            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Favori ajouté",
                        body: message,
                        sound: true,
                    },
                    trigger: { seconds: 1 },
                });
            } catch (error) {
                console.error('Erreur lors de l\'envoi de la notification:', error);
            }
        } else {
            console.error("Invalid attraction ID:", attractionId);
        }
    };

    const openModalWithAttraction = (attraction) => {
        setSelectedAttraction(attraction);
        setModalOpen(true);
    };

    const getArrowIcon = (currentWaitTime, previousWaitTime, changeTimestamp) => {
        const now = Date.now();
        const timeElapsed = (now - changeTimestamp) / 1000 / 60;

        if (previousWaitTime != null && timeElapsed < 2) {
            if (currentWaitTime < previousWaitTime) {
                return <Icon name="arrow-down" size={20} color="green" />;
            } else if (currentWaitTime > previousWaitTime) {
                return <Icon name="arrow-up" size={20} color="red" />;
            } else {
                return <Icon name="minus" size={20} color="grey" />;
            }
        }
        return null;
    };

    const allRidesClosed = rawRideData?.length > 0 && rawRideData.every(ride => ride.status === 'CLOSED');

    return (
        <View style={styles.bodyAttraction}>
            {width > 768 && <Navbar />}
            <View style={styles.header}>
                <Button title="Liste" onPress={() => setViewMode('list')} color={viewMode === 'list' ? '#007BFF' : '#ddd'} />
                <Button title="Itinéraire" onPress={() => setViewMode('map')} color={viewMode === 'map' ? '#007BFF' : '#ddd'} />
            </View>
            {viewMode === 'list' ? (
                <ScrollView style={styles.container}>
                    <TextInput
                        placeholder="Quelle attraction aujourd'hui ?"
                        style={styles.searchAttraction}
                        value={searchTerm}
                        onChangeText={handleSearchChange}
                    />
                    <Button title="Filtrer" onPress={() => setFiltersModalVisible(true)} />
                    {allRidesClosed ? (
                        <Text style={styles.noRidesMessage}>Toutes les attractions sont actuellement fermées, à demain !</Text>
                    ) : (
                        <View style={styles.attractionsList}>
                            {filteredRideData.length > 0 ? filteredRideData.map((ride) => {
                                if (!ride || !ride._id) {
                                    console.error("Invalid ride data:", ride);
                                    return null;
                                }

                                const isFavorite = favorites.some(fav => fav._id === ride._id);
                                const previousWaitTime = previousWaitTimes[ride._id]?.previousWaitTime;
                                const currentWaitTime = ride.waitTime;
                                const changeTimestamp = changeTimestamps[ride._id];

                                return (
                                    <View key={ride._id} style={styles.card}>
                                        <View style={styles.imageWrapper}>
                                            <Image source={attractionImages[ride.name]} style={styles.imgAttraction} />
                                            <TouchableOpacity
                                                style={styles.favoriteIconWrapper}
                                                onPress={() => handleToggleFavorite(ride._id)}
                                            >
                                                <Icon
                                                    name="heart"
                                                    size={50}
                                                    color={isFavorite ? 'red' : 'white'}
                                                    style={{ opacity: isFavorite ? 1 : 0.5 }}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.cardText}>
                                            <Text style={styles.attractionName}>{ride.name}</Text>
                                            <Text style={styles.attractionLand}>{ride.land}</Text>
                                            {getArrowIcon(currentWaitTime, previousWaitTime, changeTimestamp) &&
                                                <View style={styles.arrowWrapper}>
                                                    {getArrowIcon(currentWaitTime, previousWaitTime, changeTimestamp)}
                                                </View>
                                            }
                                            <Button title="Détails" onPress={() => openModalWithAttraction(ride)} />
                                        </View>
                                        <View style={[styles.waitTime, isFavorite ? styles.waitTimeFavorite : null]}>
                                            <Text>
                                                {ride.status === 'DOWN' ? 'Indispo' :
                                                    ride.status === 'CLOSED' ? 'Fermée' :
                                                        ride.waitTime === null ? 'Sans file' : `${ride.waitTime} min`}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            }) : (
                                <Text>Aucune attraction correspondant à la recherche.</Text>
                            )}
                        </View>
                    )}
                </ScrollView>
            ) : (
                <View style={{ height: '80vh', width: '100vw' }}>
                    <AttractionsMap attractions={filteredRideData} getWaitTimeColor={(waitTime) => <Text>{waitTime} min</Text>} />
                </View>
            )}
            <Modal
                visible={filtersModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFiltersModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filtres</Text>
                        <View style={styles.filterOption}>
                            <Text>Land:</Text>
                            <Picker
                                selectedValue={filters.selectedLand}
                                onValueChange={(itemValue) => handleFilterChange('selectedLand', itemValue)}
                                style={styles.selectOption}
                            >
                                <Picker.Item label="Tous les lands" value="all" />
                                <Picker.Item label="Adventureland" value="Adventureland" />
                                <Picker.Item label="Fantasyland" value="Fantasyland" />
                                <Picker.Item label="Frontierland" value="Frontierland" />
                                <Picker.Item label="Discoveryland" value="Discoveryland" />
                                <Picker.Item label="Main Street, U.S.A" value="Main Street, U.S.A" />
                                <Picker.Item label="Production Courtyard" value="Production Courtyard" />
                                <Picker.Item label="Toon Studio" value="Toon Studio" />
                                <Picker.Item label="Avengers Campus" value="Avengers Campus" />
                            </Picker>
                        </View>
                        <View style={styles.filterOption}>
                            <Text>Type:</Text>
                            <Picker
                                selectedValue={filters.selectedType}
                                onValueChange={(itemValue) => handleFilterChange('selectedType', itemValue)}
                                style={styles.selectOption}
                            >
                                <Picker.Item label="Types d'attractions" value="all" />
                                <Picker.Item label="Famille" value="Famille" />
                                <Picker.Item label="Sensation" value="Sensation" />
                                <Picker.Item label="Sans file d’attente" value="Sans file d’attente" />
                                <Picker.Item label="Rencontre avec les personnages" value="Rencontre avec les personnages" />
                            </Picker>
                        </View>
                        <View style={styles.checkbox}>
                            <Text>Moins de 40 min d'attente</Text>
                            <Switch
                                value={filters.showShortWaitTimesOnly}
                                onValueChange={(value) => handleFilterChange('showShortWaitTimesOnly', value)}
                            />
                        </View>
                        <View style={styles.checkbox}>
                            <Text>Masquer les attractions fermées</Text>
                            <Switch
                                value={filters.hideClosedRides}
                                onValueChange={(value) => handleFilterChange('hideClosedRides', value)}
                            />
                        </View>
                        <Button title="Appliquer" onPress={() => setFiltersModalVisible(false)} />
                    </View>
                </View>
            </Modal>
            <View style={styles.footerSpace} />
            <BottomNav />
            {modalOpen && (
                <AttractionModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    attractionDetails={selectedAttraction || {}}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    bodyAttraction: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        paddingTop: 40,
        borderBottomColor: '#E0E0E0',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    container: {
        padding: 15,
    },
    footerSpace: {
        height: 80,
    },
    searchAttraction: {
        padding: 12,
        fontSize: 16,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
    },
    filters: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    filterOption: {
        marginBottom: 15,
    },
    selectOption: {
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#FFF',
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    noRidesMessage: {
        textAlign: 'center',
        color: '#999999',
    },
    attractionsList: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        width: '48%',
        minWidth: '48%',
        maxWidth: '48%',
    },
    imageWrapper: {
        position: 'relative',
    },
    imgAttraction: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    favoriteIconWrapper: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        borderRadius: 25,
        padding: 10,
    },
    cardText: {
        alignItems: 'center',
    },
    attractionName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333333',
        textAlign: 'center',
    },
    attractionLand: {
        fontSize: 14,
        color: '#777777',
        textAlign: 'center',
        marginBottom: 10,
    },
    waitTime: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 15,
        padding: 5,
        color: '#333333',
        fontSize: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    waitTimeHigh: {
        backgroundColor: '#FF6347',
    },
    waitTimeFavorite: {
        backgroundColor: '#FFD700',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default AttractionsScreen;
