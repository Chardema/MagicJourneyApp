import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    Modal,
    Switch,
} from 'react-native';
import axios from 'axios';
import { useWindowWidth } from '../components/utils';
import {
    setAttractions,
    setRawRideData,
    setFilteredRideData,
    setSearchTerm,
    toggleFavorite,
} from '../redux/actions/actions';
import BottomNav from '../components/mobileNavbar';
import AttractionsMap from '../components/AttractionsMap';
import AttractionModal from '../components/ModalAttractions';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getFilteredRideData,
    getRawRideData,
    getFilters,
    getSearchTerm,
} from '../components/utils';
import LoadingScreen from '../components/LoadingScreenData';
import AttractionCard from '../components/AttractionCard';

const AttractionsScreen = () => {
    const dispatch = useDispatch();
    const rawRideData = useSelector(getRawRideData);
    const searchTerm = useSelector(getSearchTerm);
    const favorites = useSelector((state) => state.favorites.favorites);
    const filters = useSelector(getFilters);
    const filteredRideData = useSelector(getFilteredRideData);

    const [viewMode, setViewMode] = useState('list');
    const [previousWaitTimes, setPreviousWaitTimes] = useState({});
    const [changeTimestamps, setChangeTimestamps] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [filtersModalVisible, setFiltersModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(false); // Pour garantir que les données ne sont récupérées qu'une seule fois
    const [isFetching, setIsFetching] = useState(false);   // Pour contrôler les appels API

    const width = useWindowWidth();
    const navigation = useNavigation();

    // Enlève le header par défaut
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Fonction pour appliquer les filtres
    const applyFilters = useCallback((data) => {
        let filteredData = [...data];

        // Appliquer les filtres
        if (filters.selectedLand !== 'all') {
            filteredData = filteredData.filter((ride) => ride.land === filters.selectedLand);
        }

        if (filters.selectedType !== 'all') {
            filteredData = filteredData.filter((ride) => ride.type === filters.selectedType);
        }

        if (filters.showShortWaitTimesOnly) {
            filteredData = filteredData.filter((ride) => ride.waitTime && ride.waitTime < 40);
        }

        if (filters.hideClosedRides) {
            filteredData = filteredData.filter((ride) => ride.status !== 'CLOSED');
        }

        if (searchTerm) {
            filteredData = filteredData.filter((ride) =>
                ride.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filteredData;
    }, [filters, searchTerm]);

    // Fonction pour récupérer les données
    const fetchData = useCallback(async () => {
        // Empêche de lancer la requête si déjà en cours
        if (isFetching) return;
        setIsFetching(true);

        try {
            const cachedData = await AsyncStorage.getItem('attractionsData');
            const cachedWaitTimes = await AsyncStorage.getItem('waitTimes');
            let parsedData = [];
            let parsedWaitTimes = {};

            // Utiliser les données en cache si disponibles
            if (cachedData) {
                parsedData = JSON.parse(cachedData);
                dispatch(setRawRideData(parsedData));
                dispatch(setAttractions(parsedData));
            }

            if (cachedWaitTimes) {
                parsedWaitTimes = JSON.parse(cachedWaitTimes);
                setPreviousWaitTimes(parsedWaitTimes);
            }

            // Si les données en cache sont absentes ou si c'est le premier chargement, faire un appel API
            if (!cachedData || !initialLoad) {
                const response = await axios.get('https://servermagic.vercel.app/api/attractions');
                const rideData = response.data;

                // Vérifier si les données ont changé avant de les sauvegarder
                if (JSON.stringify(rideData) !== JSON.stringify(rawRideData)) {
                    await AsyncStorage.setItem('attractionsData', JSON.stringify(rideData));
                    dispatch(setRawRideData(rideData));
                    dispatch(setAttractions(rideData));

                    const newPreviousWaitTimes = {};
                    rideData.forEach((ride) => {
                        const prevWaitTime = previousWaitTimes[ride._id]?.currentWaitTime;
                        newPreviousWaitTimes[ride._id] = {
                            currentWaitTime: ride.waitTime,
                            previousWaitTime: prevWaitTime || null,
                            hadPreviousWaitTime: !!prevWaitTime,
                        };
                    });

                    setPreviousWaitTimes(newPreviousWaitTimes);
                    await AsyncStorage.setItem('waitTimes', JSON.stringify(newPreviousWaitTimes));
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des attractions:', error);
        } finally {
            setInitialLoad(true);  // Indiquer que le premier chargement est fait
            setIsFetching(false);  // Fin de la requête
        }
    }, [dispatch, previousWaitTimes, rawRideData, initialLoad, isFetching]);

    // Récupérer les données une seule fois lors du premier montage et mettre à jour toutes les 60 secondes
    useEffect(() => {
        if (!initialLoad) {
            fetchData(); // Charger les données seulement si c'est la première fois
        }

        const intervalId = setInterval(() => {
            fetchData();
        }, 60000); // Mettre à jour toutes les 60 secondes

        return () => clearInterval(intervalId); // Nettoyer l'intervalle lors du démontage du composant
    }, [fetchData, initialLoad]);

    useEffect(() => {
        if (rawRideData && initialLoad) {
            const newFilteredData = applyFilters(rawRideData);
            dispatch(setFilteredRideData(newFilteredData));
            setLoading(false); // Définir loading à false ici
        }
    }, [rawRideData, applyFilters, dispatch, initialLoad]);

    // Gestion du changement de filtre
    const handleFilterChange = (filter, value) => {
        dispatch({ type: 'SET_FILTER', payload: { filter, value } });
    };

    // Gestion de la recherche
    const handleSearchChange = (text) => {
        dispatch(setSearchTerm(text));
    };

    // Gestion des favoris
    const handleToggleFavorite = async (attractionId) => {
        try {
            if (!attractionId) return;
            dispatch(toggleFavorite(attractionId));
        } catch (error) {
            console.error('Erreur lors de l\'ajout aux favoris:', error);
        }
    };

    // Ouverture du modal avec les détails de l'attraction
    const openModalWithAttraction = (attraction) => {
        setSelectedAttraction(attraction);
        setModalOpen(true);
    };

    // Affichage de l'écran de chargement si les données sont en cours de chargement
    if (loading || !rawRideData || !filteredRideData) {
        return <LoadingScreen />;
    }

    return (
        <View style={styles.bodyAttraction}>
            <View style={styles.header}>
                <Button
                    title="Liste"
                    onPress={() => setViewMode('list')}
                    color={viewMode === 'list' ? '#007BFF' : '#ddd'}
                    disabled={loading}
                />
                <Button
                    title="Itinéraire"
                    onPress={() => setViewMode('map')}
                    color={viewMode === 'map' ? '#007BFF' : '#ddd'}
                    disabled={loading}
                />
            </View>
            {viewMode === 'list' ? (
                <ScrollView style={styles.container}>
                    <TextInput
                        placeholder="Quelle attraction aujourd'hui ?"
                        style={styles.searchAttraction}
                        value={searchTerm}
                        onChangeText={handleSearchChange}
                        editable={!loading}
                    />
                    <Button
                        title="Filtrer"
                        onPress={() => setFiltersModalVisible(true)}
                        disabled={loading}
                    />
                    <View style={styles.attractionsList}>
                        {filteredRideData && filteredRideData.length > 0 ? (
                            filteredRideData.map((ride) => {
                                const isFavorite = favorites.some((fav) => fav._id === ride._id);
                                const previousWaitTime = previousWaitTimes[ride._id]?.previousWaitTime;
                                const currentWaitTime = ride.waitTime;
                                const changeTimestamp = changeTimestamps[ride._id];

                                return (
                                    <AttractionCard
                                        key={ride._id}
                                        item={ride}
                                        onToggleFavorite={handleToggleFavorite}
                                        onDetailsPress={openModalWithAttraction}
                                        isFavorite={isFavorite}
                                    />
                                );
                            })
                        ) : (
                            <Text>Aucune attraction correspondant à la recherche.</Text>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>
                    <AttractionsMap
                        attractions={filteredRideData || []}
                    />
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
