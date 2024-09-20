// HomeScreen.js

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Button, ButtonGroup } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import useParkHours from "../components/hooks/useParkHours";
import ReactNativeModal from 'react-native-modal';
import { useDispatch, useSelector } from 'react-redux';
import { setAttractions, setShows, setRestaurants } from '../redux/actions/actions';
import {
    attractionImages,
    normalizeName,
    formatImageName,
    importImage,
    showImagesMap,
    restaurantImagesMap
} from "../components/utils";
import ScheduledActivityCard from "../components/ScheduleActivityCard";
import { Swipeable } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import BackgroundFetch from 'react-native-background-fetch';

const HomeScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const [userName, setUserName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [duration, setDuration] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [step, setStep] = useState(1);
    const [isTripPlanned, setIsTripPlanned] = useState(false);
    const [currentDate, setCurrentDate] = useState(null);
    const parkHours = useParkHours();
    const [availableDates, setAvailableDates] = useState([]);
    const [activities, setActivities] = useState({});
    const [isActivityModalVisible, setActivityModalVisible] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [selectedActivitiesInModal, setSelectedActivitiesInModal] = useState([]);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
    const [countdown, setCountdown] = useState('');

    const categories = ['Attractions', 'Shows', 'Restaurants'];

    const attractions = useSelector((state) => state.attractions.attractions);
    const shows = useSelector((state) => state.shows.shows);
    const restaurants = useSelector((state) => state.restaurants.restaurants);

    // Fonction pour sauvegarder les données du voyage dans AsyncStorage
    const saveTripData = async (data) => {
        try {
            await AsyncStorage.setItem('tripData', JSON.stringify(data));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données du voyage:', error);
        }
    };

    // Fonction pour charger les données du voyage depuis AsyncStorage
    const loadTripData = async () => {
        try {
            const storedTripData = await AsyncStorage.getItem('tripData');
            if (storedTripData) {
                const parsedData = JSON.parse(storedTripData);
                setActivities(parsedData.activities || {});
                setIsTripPlanned(parsedData.isTripPlanned || false);
                setStartDate(parsedData.startDate ? new Date(parsedData.startDate) : null);
                setEndDate(parsedData.endDate ? new Date(parsedData.endDate) : null);
                setAvailableDates(parsedData.availableDates ? parsedData.availableDates.map(date => new Date(date)) : []);
                setCurrentDate(parsedData.currentDate ? new Date(parsedData.currentDate) : null);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données du voyage:', error);
        }
    };

    // Sauvegarder les données du voyage chaque fois qu'elles changent
    useEffect(() => {
        if (isTripPlanned && currentDate) {
            saveTripData({
                activities,
                isTripPlanned,
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                availableDates: availableDates ? availableDates.map(date => date.toISOString()) : [],
                currentDate: currentDate.toISOString(),
            });
        }
    }, [activities, isTripPlanned, startDate, endDate, availableDates, currentDate]);

    useEffect(() => {
        dispatch(setAttractions());
        dispatch(setShows());
        dispatch(setRestaurants()); // Charger les restaurants une seule fois
    }, [dispatch]);

    useEffect(() => {
        if (
            attractions && shows && restaurants &&
            attractions.length > 0 && shows.length > 0 && restaurants.length > 0
        ) {
            setDataLoaded(true);
        }
    }, [attractions, shows, restaurants]);

    // Récupérer les données utilisateur depuis AsyncStorage
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedResponses = await AsyncStorage.getItem('userResponses');
                if (storedResponses) {
                    const parsedResponses = JSON.parse(storedResponses);
                    setUserName(parsedResponses.name || '');
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données utilisateur:', error);
            }
        };
        loadUserData();
        loadTripData(); // Charger les données du voyage au démarrage
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerShown: false, // Masquer le header ici
        });
    }, [navigation]);

    // Configuration du rafraîchissement des attractions et shows toutes les 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(setAttractions());
            dispatch(setShows());
            // Pas besoin de rafraîchir les restaurants car ils sont statiques
        }, 120000); // 120 000 ms = 2 minutes

        return () => clearInterval(interval);
    }, [dispatch]);

    // Configuration du rafraîchissement en arrière-plan
    useEffect(() => {
        const configureBackgroundFetch = async () => {
            const status = await BackgroundFetch.configure(
                {
                    minimumFetchInterval: 2, // En minutes
                },
                async (taskId) => {
                    console.log('[BackgroundFetch] taskId:', taskId);
                    dispatch(setAttractions());
                    dispatch(setShows());
                    // Pas besoin de rafraîchir les restaurants en arrière-plan
                    BackgroundFetch.finish(taskId);
                },
                (error) => {
                    console.log('[BackgroundFetch] Erreur:', error);
                }
            );

            console.log('[BackgroundFetch] Status:', status);
        };

        configureBackgroundFetch();
    }, [dispatch]);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirmDate = (date) => {
        setStartDate(date);
        setStep(2);
        hideDatePicker();
    };

    const handleDurationInput = (input) => {
        if (/^\d+$/.test(input)) {
            setDuration(input);
            const days = parseInt(input);
            if (startDate) {
                const calculatedEndDate = new Date(startDate);
                calculatedEndDate.setDate(startDate.getDate() + days - 1);
                setEndDate(calculatedEndDate);

                const dates = [];
                for (let i = 0; i < days; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    dates.push(currentDate);
                }
                setAvailableDates(dates);
                setCurrentDate(dates[0]);
            }
        }
    };

    const handleSaveTrip = () => {
        setIsTripPlanned(true);
        setShowModal(false);
        setStep(1);
    };

    const handlePlanTrip = () => {
        setShowModal(true);
        setStep(1);
    };

    // Mise à jour du compte à rebours
    useEffect(() => {
        if (startDate) {
            const interval = setInterval(() => {
                const now = new Date();
                const timeDifference = startDate - now;
                if (timeDifference > 0) {
                    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

                    setCountdown(`${days}j ${hours}h ${minutes}m ${seconds}s`);
                } else {
                    setCountdown('Le séjour commence aujourd\'hui!');
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [startDate]);

    const renderScheduleInfo = () => {
        const selectedDay = currentDate ? currentDate.toISOString().split('T')[0] : null;
        const selectedDaySchedules = parkHours?.disneyland?.schedule?.filter(schedule => schedule.date === selectedDay);
        const operatingSchedule = selectedDaySchedules?.find(s => s.type === "OPERATING");

        if (!operatingSchedule) {
            return <Text style={styles.scheduleMessage}>Il est encore un peu tôt pour voir les heures !</Text>;
        }

        return (
            <Text style={styles.schedule}>
                Heures d'ouverture du Parc Disneyland : {new Date(operatingSchedule.openingTime).toLocaleTimeString()} - {new Date(operatingSchedule.closingTime).toLocaleTimeString()}
            </Text>
        );
    };

    const addActivity = () => {
        setActivityModalVisible(true);
    };

    const handleSelectActivity = (activity) => {
        if (selectedActivitiesInModal.some(a => a._id === activity._id)) {
            // Si déjà sélectionné, le retirer
            setSelectedActivitiesInModal(prev => prev.filter(a => a._id !== activity._id));
        } else {
            // Sinon, l'ajouter
            setSelectedActivitiesInModal(prev => [...prev, activity]);
        }
    };

    const confirmSelectedActivities = () => {
        // Ajouter une propriété 'done' et 'category' à chaque activité
        const activitiesWithProperties = selectedActivitiesInModal.map(activity => ({
            ...activity,
            done: false,
            category: categories[selectedCategoryIndex],
        }));
        setActivities(prevActivities => ({
            ...prevActivities,
            [currentDate.toDateString()]: [
                ...(prevActivities[currentDate.toDateString()] || []),
                ...activitiesWithProperties,
            ]
        }));
        setSelectedActivitiesInModal([]);
        setActivityModalVisible(false);
    };

    const handleNextDay = () => {
        const currentIndex = availableDates.findIndex(date => date.toDateString() === currentDate?.toDateString());
        if (currentIndex < availableDates.length - 1) {
            setCurrentDate(availableDates[currentIndex + 1]);
        }
    };

    const handlePreviousDay = () => {
        const currentIndex = availableDates.findIndex(date => date.toDateString() === currentDate?.toDateString());
        if (currentIndex > 0) {
            setCurrentDate(availableDates[currentIndex - 1]);
        }
    };

    // Fonction pour marquer une activité comme "Fait" ou "Non fait"
    const toggleActivityDone = (activityToToggle) => {
        setActivities(prevActivities => {
            const updatedActivities = prevActivities[currentDate.toDateString()].map(activity => {
                if (activity._id === activityToToggle._id) {
                    return { ...activity, done: !activity.done };
                }
                return activity;
            });
            return {
                ...prevActivities,
                [currentDate.toDateString()]: updatedActivities,
            };
        });
    };

    // Fonction pour supprimer une activité
    const handleDeleteActivity = (activityToDelete) => {
        setActivities(prevActivities => {
            const updatedActivities = prevActivities[currentDate.toDateString()].filter(
                activity => activity._id !== activityToDelete._id
            );
            return {
                ...prevActivities,
                [currentDate.toDateString()]: updatedActivities,
            };
        });
    };

    // Fonction pour gérer la fin du drag-and-drop
    const handleDragEnd = ({ data }) => {
        setActivities(prevActivities => ({
            ...prevActivities,
            [currentDate.toDateString()]: data,
        }));
    };

    const getImageForActivity = (activity, category = null) => {
        if (!activity || !activity.name) {
            return attractionImages['default.jpg'];
        }

        const normalizedName = normalizeName(activity.name);

        if (category) {
            if (category === 'Shows') {
                return showImagesMap[normalizedName] || showImagesMap['default.jpg'];
            } else if (category === 'Restaurants') {
                // Si vous avez un mapping pour les restaurants, utilisez-le ici
                return restaurantImagesMap[normalizedName] || attractionImages['default.jpg'];
            } else {
                // Par défaut, attractions
                return attractionImages[normalizedName] || attractionImages['default.jpg'];
            }
        } else if (activity.category) {
            // Si la catégorie est déjà définie sur l'activité
            if (activity.category === 'Shows') {
                return showImagesMap[normalizedName] || showImagesMap['default.jpg'];
            } else if (activity.category === 'Restaurants') {
                return restaurantImagesMap[normalizedName] || attractionImages['default.jpg'];
            } else {
                return attractionImages[normalizedName] || attractionImages['default.jpg'];
            }
        } else {
            // Cas par défaut
            return attractionImages[normalizedName] || attractionImages['default.jpg'];
        }
    };

    // Mise à jour du renderItem pour intégrer Swipeable et DraggableFlatList
    const renderItem = ({ item, index, drag, isActive }) => {
        const renderRightActions = () => (
            <View style={styles.rightActionContainer}>
                <TouchableOpacity
                    style={styles.doneButtonContainer}
                    onPress={() => toggleActivityDone(item)}
                >
                    <Text style={styles.doneButtonText}>{item.done ? 'Non fait' : 'Fait'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButtonContainer}
                    onPress={() => handleDeleteActivity(item)}
                >
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                </TouchableOpacity>
            </View>
        );


        return (
            <Swipeable renderRightActions={renderRightActions}>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        styles.cardWrapper,
                        isActive && { backgroundColor: '#f0f0f0' },
                        item.done && styles.doneActivity,
                    ]}
                >
                    <ScheduledActivityCard activity={item} />
                </TouchableOpacity>
            </Swipeable>
        );
    };

    // Trier les activités : celles non faites en haut, celles faites en bas
    const getSortedActivities = () => {
        const dayActivities = activities[currentDate?.toDateString()] || [];
        const notDoneActivities = dayActivities.filter(activity => !activity.done);
        const doneActivities = dayActivities.filter(activity => activity.done);
        return [...notDoneActivities, ...doneActivities];
    };

    return (
        <SafeAreaView style={styles.homePage}>
            <View style={styles.content}>
                {/* Afficher le prénom de l'utilisateur */}
                {userName ? (
                    <Text style={styles.welcomeText}>Bienvenue, {userName} !</Text>
                ) : (
                    <Text style={styles.welcomeText}>Bienvenue !</Text>
                )}

                {/* Afficher le compte à rebours */}
                {startDate && (
                    <Text style={styles.countdownText}>
                        {countdown}
                    </Text>
                )}

                {/* Bouton pour planifier le séjour */}
                {!isTripPlanned && (
                    <Button
                        title="Je planifie mon séjour"
                        onPress={handlePlanTrip}
                        buttonStyle={styles.planTripButton}
                    />
                )}

                {/* Affichage des dates avec sélecteur de jour */}
                {isTripPlanned && (
                    <View style={styles.tripContainer}>
                        <View style={styles.dateNavigator}>
                            <TouchableOpacity onPress={handlePreviousDay} disabled={availableDates.findIndex(date => date.toDateString() === currentDate?.toDateString()) === 0}>
                                <Image source={require('../assets/icons/left-arrow.png')} style={styles.arrowIcon} />
                            </TouchableOpacity>
                            <Text style={styles.currentDateText}>{currentDate?.toLocaleDateString()}</Text>
                            <TouchableOpacity onPress={handleNextDay} disabled={availableDates.findIndex(date => date.toDateString() === currentDate?.toDateString()) === availableDates.length - 1}>
                                <Image source={require('../assets/icons/right-arrow.png')} style={styles.arrowIcon} />
                            </TouchableOpacity>
                        </View>
                        {/* Afficher les horaires d'ouverture */}
                        {renderScheduleInfo()}
                        {/* Affichage des activités pour le jour sélectionné */}
                        <View style={styles.activitiesContainer}>
                            {currentDate && activities[currentDate.toDateString()]?.length > 0 ? (
                                <DraggableFlatList
                                    data={getSortedActivities()}
                                    keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
                                    renderItem={renderItem}
                                    onDragEnd={handleDragEnd}
                                    activationDistance={5}  // Sensibilité améliorée pour le glisser
                                    dragItemOverflow={false}
                                    scrollEnabled={true}
                                    contentContainerStyle={{ paddingBottom: 50 }}
                                />
                            ) : (
                                <Text style={styles.noActivitiesText}>Aucune activité pour ce jour.</Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Modal pour planifier le séjour */}
                <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowModal(false)}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Planifier votre séjour</Text>

                            {step === 1 ? (
                                <>
                                    {/* Étape 1 : Sélection de la date de début */}
                                    <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
                                        <Text style={styles.datePickerText}>
                                            {startDate
                                                ? `Début du séjour : ${startDate.toLocaleDateString()}`
                                                : 'Sélectionner la date de début'}
                                        </Text>
                                    </TouchableOpacity>
                                    <DateTimePickerModal
                                        isVisible={isDatePickerVisible}
                                        mode="date"
                                        onConfirm={handleConfirmDate}
                                        onCancel={hideDatePicker}
                                    />
                                </>
                            ) : (
                                <>
                                    {/* Étape 2 : Sélection de la durée du séjour */}
                                    <TextInput
                                        placeholder="Durée du séjour (en jours)"
                                        value={duration}
                                        onChangeText={handleDurationInput}
                                        keyboardType="numeric"
                                        style={styles.input}
                                    />
                                    {endDate && (
                                        <Text style={styles.dateSummary}>
                                            Votre séjour sera du {startDate.toLocaleDateString()} au {endDate.toLocaleDateString()}
                                        </Text>
                                    )}
                                </>
                            )}

                            {/* Bouton pour sauvegarder */}
                            {step === 2 && <Button title="Valider" onPress={handleSaveTrip} buttonStyle={styles.validateButton} />}

                            {/* Bouton pour fermer le modal */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.closeButtonText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Bottom Sheet pour sélectionner des activités */}
                <ReactNativeModal
                    isVisible={isActivityModalVisible}
                    onBackdropPress={() => setActivityModalVisible(false)}
                    style={styles.bottomModal}
                    swipeDirection="down"
                    onSwipeComplete={() => setActivityModalVisible(false)}
                    propagateSwipe={true}
                >
                    <View style={styles.activityModalContainer}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.activityModalTitle}>Sélectionnez des activités</Text>

                        {/* Groupe de boutons pour les catégories */}
                        <ButtonGroup
                            onPress={setSelectedCategoryIndex}
                            selectedIndex={selectedCategoryIndex}
                            buttons={categories}
                            containerStyle={styles.buttonGroupContainer}
                            selectedButtonStyle={styles.selectedButtonStyle}
                            textStyle={styles.buttonGroupText}
                        />

                        {dataLoaded ? (
                            <>
                                <FlatList
                                    data={
                                        selectedCategoryIndex === 0
                                            ? attractions
                                            : selectedCategoryIndex === 1
                                                ? shows
                                                : restaurants
                                    }
                                    keyExtractor={(item, index) => (item?._id ? item._id.toString() : index.toString())}
                                    renderItem={({ item }) => {
                                        const isSelected = selectedActivitiesInModal.some(a => a._id === item._id);
                                        const category = categories[selectedCategoryIndex];
                                        const imageSource = getImageForActivity(item, category);

                                        return (
                                            <TouchableOpacity
                                                style={[
                                                    styles.activityItem,
                                                    isSelected && styles.activityItemSelected,
                                                ]}
                                                onPress={() => handleSelectActivity(item)}
                                            >
                                                <View style={styles.activityInfo}>
                                                    <Image
                                                        source={imageSource}
                                                        style={styles.activityImage}
                                                    />
                                                    <View style={styles.activityDetails}>
                                                        <Text style={styles.activityItemText}>{item.name}</Text>
                                                        {item.waitTime !== undefined && (
                                                            <Text style={styles.waitTime}>
                                                                Temps d'attente : {item.waitTime} min
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                                {isSelected && <Text style={styles.selectedIndicator}>✔</Text>}
                                            </TouchableOpacity>
                                        );
                                    }}

                                />
                                <Button
                                    title="Ajouter les activités sélectionnées"
                                    onPress={confirmSelectedActivities}
                                    disabled={selectedActivitiesInModal.length === 0}
                                    buttonStyle={styles.addButton}
                                />
                            </>
                        ) : (
                            <ActivityIndicator size="large" color="#0000ff" />
                        )}
                    </View>
                </ReactNativeModal>
            </View>

            {/* Bouton flottant pour ajouter des activités */}
            {isTripPlanned && (
                <TouchableOpacity style={styles.fab} onPress={addActivity}>
                    <Image source={require('../assets/icons/add.png')} style={styles.fabIcon} />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    homePage: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative', // Ajouté pour le positionnement relatif du FAB
    },
    content: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 15,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    countdownText: {
        fontSize: 24,
        fontWeight: '500',
        color: '#FF9500',
        textAlign: 'center',
        marginVertical: 10,
    },
    planTripButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 12,
        marginHorizontal: 20,
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 20,
        marginHorizontal: 20,
    },
    validateButton: {
        backgroundColor: '#34C759',
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 20,
        marginHorizontal: 20,
    },
    parkHoursContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    scheduleMessage: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
    tripContainer: {
        flex: 1,
        marginTop: 20,
        alignItems: 'center',
    },
    dateNavigator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    currentDateText: {
        fontSize: 20,
        marginHorizontal: 20,
        fontWeight: '500',
    },
    arrowIcon: {
        width: 24,
        height: 24,
        tintColor: '#007AFF',
    },
    activitiesContainer: {
        flex: 1,
        marginTop: 20,
        alignSelf: 'stretch',
        paddingHorizontal: 15,
    },
    noActivitiesText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginTop: 20,
    },
    activityText: {
        fontSize: 16,
        marginVertical: 5,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
    },
    datePickerButton: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        width: '100%',
    },
    datePickerText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 15,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        textAlign: 'center',
    },
    dateSummary: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    activityModalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 10,
    },
    activityModalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    buttonGroupContainer: {
        marginBottom: 15,
        borderRadius: 10,
    },
    selectedButtonStyle: {
        backgroundColor: '#007AFF',
    },
    buttonGroupText: {
        fontSize: 16,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activityItemSelected: {
        backgroundColor: '#e6f7ff',
    },
    activityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    activityImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    activityDetails: {
        flex: 1,
    },
    activityItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    waitTime: {
        fontSize: 14,
        color: '#555',
    },
    selectedIndicator: {
        fontSize: 18,
        color: '#007AFF',
        paddingRight: 10,
    },
    doneActivity: {
        opacity: 0.5,
    },
    rightActionContainer: {
        flexDirection: 'row',
        width: 160,
    },
    doneButtonContainer: {
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    doneButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    deleteButtonContainer: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        right: 20,
        bottom: 100,
        elevation: 8, // Pour ajouter une ombre sur Android
        shadowColor: '#000', // Pour ajouter une ombre sur iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    fabIcon: {
        width: 24,
        height: 24,
        tintColor: 'white',
    },
});

export default HomeScreen;
