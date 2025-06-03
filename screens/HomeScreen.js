// HomeScreen.js

import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Image,
    ImageBackground,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import {
    setAttractions,
    setShows,
    setRestaurants,
    setWaitTimes,
} from '../redux/actions/actions';
import TripPlanModal from '../components/Homescreen/TripPlanModal';
import ActivityModal from '../components/Homescreen/ActivityModal';
import ActivityList from '../components/Homescreen/ActivityList';
import AttractionDetailsModal from "../components/AttractionsDetailsModal";
import { Button } from 'react-native-elements';
import {
    attractionImages,
    normalizeName,
    restaurantImagesMap,
    showImagesMap,
} from '../components/utils';
import BottomNav from '../components/mobileNavbar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAttractionAvailable } from '../components/utils/attractionAvailability';

const HomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const [userName, setUserName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [favoriteAttraction, setFavoriteAttraction] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [duration, setDuration] = useState('');
    const [currentDate, setCurrentDate] = useState(null);
    const [isTripPlanned, setIsTripPlanned] = useState(false);
    const [availableDates, setAvailableDates] = useState([]);
    const [activities, setActivities] = useState({});
    const [isActivityModalVisible, setActivityModalVisible] = useState(false);
    const [selectedActivitiesInModal, setSelectedActivitiesInModal] = useState([]);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [countdown, setCountdown] = useState('');
    const [isAttractionModalVisible, setAttractionModalVisible] = useState(false);
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('morning');
    const [hasExtraMagicHours, setHasExtraMagicHours] = useState(false);

    const timeSlots = ['morning', 'afternoon', 'evening'];

    const categories = ['Attractions', 'Shows', 'Restaurants'];
    const attractions = useSelector((state) => state.attractions.attractions) || [];
    const shows = useSelector((state) => state.shows.shows) || [];
    const restaurants = useSelector((state) => state.restaurants.restaurants) || [];
    const waitTimes = useSelector((state) => state.waitTimes) || {};

    const [parkSchedules, setParkSchedules] = useState({});

    const parkIds = {
        'Disneyland Park': 'dae968d5-630d-4719-8b06-3d107e944401',
        'Walt Disney Studios Park': 'ca888437-ebb4-4d50-aed2-d227f7096968',
    };

    useEffect(() => {
        dispatch(setAttractions());
        dispatch(setShows());
        dispatch(setRestaurants());
        dispatch(setWaitTimes());
    }, [dispatch]);

    useEffect(() => {
        if (attractions.length > 0 && shows.length > 0 && restaurants.length > 0) {
            setDataLoaded(true);
        }
    }, [attractions, shows, restaurants]);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedResponses = await AsyncStorage.getItem('userResponses');
                if (storedResponses) {
                    const parsedResponses = JSON.parse(storedResponses);
                    setUserName(parsedResponses.name || '');
                    setFavoriteAttraction(parsedResponses.favoriteAttraction || '');
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données utilisateur:', error);
            }
        };
        loadUserData();
    }, []);

    // Fonction pour récupérer les horaires du parc
    const fetchParkSchedules = async () => {
        try {
            const dates = availableDates.map(date => date.toISOString().split('T')[0]);
            const parkScheduleData = {};

            for (const [parkName, parkId] of Object.entries(parkIds)) {
                const response = await fetch(`https://api.themeparks.wiki/v1/entity/${parkId}/schedule`);
                const data = await response.json();

                // Filtrer les horaires pour les dates sélectionnées
                const schedules = data.schedule.filter(schedule =>
                    dates.includes(schedule.date)
                );

                parkScheduleData[parkName] = schedules;
            }

            setParkSchedules(parkScheduleData);
        } catch (error) {
            console.error('Erreur lors de la récupération des horaires du parc:', error);
        }
    };

    // Fonction pour effacer le localStorage
    const clearLocalStorage = async () => {
        try {
            await AsyncStorage.clear();
            setIsTripPlanned(false);
            setActivities({});
            setUserName('');
            setStartDate(null);
            setDuration('');
            setAvailableDates([]);
            setCurrentDate(null);
            setParkSchedules({});
            console.log('Local storage cleared');
        } catch (error) {
            console.error('Erreur lors de la réinitialisation du localStorage:', error);
        }
    };

    useEffect(() => {
        const loadTripData = async () => {
            try {
                const storedTripData = await AsyncStorage.getItem('tripData');
                if (storedTripData) {
                    const parsedData = JSON.parse(storedTripData);
                    setActivities(parsedData.activities || {});
                    setIsTripPlanned(parsedData.isTripPlanned || false);
                    setStartDate(parsedData.startDate ? new Date(parsedData.startDate) : null);
                    setAvailableDates(
                        parsedData.availableDates
                            ? parsedData.availableDates.map((date) => new Date(date))
                            : []
                    );
                    setCurrentDate(parsedData.currentDate ? new Date(parsedData.currentDate) : null);

                    // Gérer hasExtraMagicHours
                    if ('hasExtraMagicHours' in parsedData) {
                        setHasExtraMagicHours(parsedData.hasExtraMagicHours);
                    } else {
                        setHasExtraMagicHours(false);
                    }
                } else {
                    setHasExtraMagicHours(false);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données du voyage:', error);
            }
        };

        loadTripData();
    }, []);

    useEffect(() => {
        if (isTripPlanned && currentDate) {
            saveTripData({
                activities,
                isTripPlanned,
                startDate: startDate ? startDate.toISOString() : null,
                availableDates: availableDates ? availableDates.map((date) => date.toISOString()) : [],
                currentDate: currentDate ? currentDate.toISOString() : null,
                hasExtraMagicHours,
            });
        }
    }, [activities, isTripPlanned, startDate, availableDates, currentDate, hasExtraMagicHours]);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            let targetTime;

            if (startDate) {
                targetTime = new Date(startDate);
                targetTime.setHours(0, 0, 0, 0);
            } else {
                targetTime = new Date();
            }

            const timeDifference = targetTime - now;

            if (timeDifference > 0) {
                const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
                const hours = Math.floor(
                    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const minutes = Math.floor(
                    (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
                );
                const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

                setCountdown(`${days}j ${hours}h ${minutes}m ${seconds}s`);
            } else {
                setCountdown('Bon séjour !');
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [startDate]);

    // Mettre à jour les activités avec les temps d'attente
    useEffect(() => {
        if (!currentDate) return;

        setActivities((prevActivities) => {
            const dateKey = currentDate.toDateString();
            const activitiesForDate = prevActivities[dateKey] || {
                morning: [],
                afternoon: [],
                evening: [],
            };

            const updateActivityList = (list) =>
                list.map((activity) => {
                    const updatedWaitTime = waitTimes[activity._id];
                    return {
                        ...activity,
                        waitTime: updatedWaitTime !== undefined ? updatedWaitTime : activity.waitTime,
                    };
                });

            return {
                ...prevActivities,
                [dateKey]: {
                    morning: updateActivityList(activitiesForDate.morning || []),
                    afternoon: updateActivityList(activitiesForDate.afternoon || []),
                    evening: updateActivityList(activitiesForDate.evening || []),
                },
            };
        });
    }, [waitTimes, currentDate]);

    // Mettre à jour les temps d'attente à intervalles réguliers
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(setWaitTimes());
        }, 5 * 60 * 1000); // Mise à jour toutes les 5 minutes

        return () => clearInterval(interval);
    }, [dispatch]);

    const saveTripData = async (data) => {
        try {
            await AsyncStorage.setItem('tripData', JSON.stringify(data));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données du voyage:', error);
        }
    };

    const getImageSource = () => {
        switch (favoriteAttraction) {
            case 'Buzz Lightyear Laser Blast':
                return require('../assets/buzz_lightyear.jpg');
            case 'It’s a Small World':
                return require('../assets/small_world.jpeg');
            case 'La Tour de la Terreur':
                return require('../assets/tour_terreur.jpg');
            case 'Pirates des Caraïbes':
                return require('../assets/pirates_des_caraibes.jpg');
            default:
                return require('../assets/default.jpg');
        }
    };

    const handleSaveTrip = () => {
        if (startDate && duration) {
            const days = parseInt(duration, 10);
            const dates = [];
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                dates.push(date);
            }
            setAvailableDates(dates);
            setCurrentDate(dates[0]);

            // Récupérer les horaires du parc après avoir défini les dates disponibles
            fetchParkSchedules();

            setIsTripPlanned(true);
            setShowModal(false);
        }
    };

    const handlePlanTrip = () => setShowModal(true);

    const handleNextDay = () => {
        if (!currentDate) return;
        const currentIndex = availableDates.findIndex(
            (date) => date.toDateString() === currentDate.toDateString()
        );
        if (currentIndex < availableDates.length - 1) {
            setCurrentDate(availableDates[currentIndex + 1]);
        }
    };

    const handlePreviousDay = () => {
        if (!currentDate) return;
        const currentIndex = availableDates.findIndex(
            (date) => date.toDateString() === currentDate.toDateString()
        );
        if (currentIndex > 0) {
            setCurrentDate(availableDates[currentIndex - 1]);
        }
    };

    const getImageForActivity = (activity, category = null) => {
        if (!activity || !activity.name) {
            return require('../assets/default.jpg');
        }

        const normalizedName = normalizeName(activity.name);

        if (category) {
            if (category === 'Shows') {
                return showImagesMap[normalizedName] || showImagesMap['default.jpg'];
            } else if (category === 'Restaurants') {
                return restaurantImagesMap[normalizedName] || restaurantImagesMap['default.jpg'];
            } else {
                return attractionImages[normalizedName] || attractionImages['default.jpg'];
            }
        } else if (activity.category) {
            if (activity.category === 'Shows') {
                return showImagesMap[normalizedName] || showImagesMap['default.jpg'];
            } else if (activity.category === 'Restaurants') {
                return restaurantImagesMap[normalizedName] || restaurantImagesMap['default.jpg'];
            } else {
                return attractionImages[normalizedName] || attractionImages['default.jpg'];
            }
        } else {
            return attractionImages[normalizedName] || attractionImages['default.jpg'];
        }
    };

    const handleLongPress = (activity) => {
        setSelectedAttraction(activity);
        setAttractionModalVisible(true);
    };

    const handleOpenActivityModal = () => {
        setActivityModalVisible(true);
    };

    // Fonction pour obtenir les heures d'ouverture et de fermeture du parc pour une date donnée
    const getParkOperatingHours = (parkName, date) => {
        if (!parkSchedules[parkName]) return null;

        const dateString = date.toISOString().split('T')[0];
        const schedulesForDate = parkSchedules[parkName].filter(
            (schedule) => schedule.date === dateString
        );

        let operatingHours = schedulesForDate.find(
            (schedule) => schedule.type === 'OPERATING'
        );

        if (!operatingHours) return null;

        let openingTime = new Date(operatingHours.openingTime);
        let closingTime = new Date(operatingHours.closingTime);

        if (hasExtraMagicHours) {
            const extraHours = schedulesForDate.find(
                (schedule) => schedule.type === 'EXTRA_HOURS'
            );
            if (extraHours) {
                openingTime = new Date(extraHours.openingTime);
            }
        }

        return { openingTime, closingTime };
    };

    // Fonction pour calculer le planning
    const calculateSchedule = (activitiesForDay) => {
        const dateKey = currentDate.toDateString();

        const activities = activitiesForDay[selectedTimeSlot] || [];

        if (activities.length === 0) return activitiesForDay;

        // Obtenir le parc de la première activité
        const firstActivity = activities[0];
        const parkName = firstActivity.parkName || 'Disneyland Park'; // Par défaut

        const operatingHours = getParkOperatingHours(parkName, currentDate);

        if (!operatingHours) {
            Alert.alert(
                'Horaires non disponibles',
                "Les horaires d'ouverture du parc ne sont pas disponibles pour cette date."
            );
            return activitiesForDay;
        }

        let currentTime = new Date(operatingHours.openingTime);

        const updatedActivities = activities.map((activity) => {
            const waitTime = waitTimes[activity._id] || 0;
            const duration = activity.duration || 30;
            const travelTime = activity.travelTime || 10;

            const plannedStartTime = new Date(
                currentTime.getTime() + travelTime * 60000 + waitTime * 60000
            );
            const plannedEndTime = new Date(
                plannedStartTime.getTime() + duration * 60000
            );

            currentTime = new Date(plannedEndTime);

            return {
                ...activity,
                plannedStartTime,
                plannedEndTime,
            };
        });

        return {
            ...activitiesForDay,
            [selectedTimeSlot]: updatedActivities,
        };
    };

    // Retirer 'activities' du tableau des dépendances pour éviter la boucle infinie
    useEffect(() => {
        if (!currentDate) return;

        const dateKey = currentDate.toDateString();
        const activitiesForDay = activities[dateKey] || {};

        const updatedActivitiesForDay = calculateSchedule(activitiesForDay);

        setActivities((prevActivities) => ({
            ...prevActivities,
            [dateKey]: updatedActivitiesForDay,
        }));
    }, [waitTimes, currentDate, hasExtraMagicHours]);

    const handleCompleteActivity = (activityId) => {
        setActivities((prevActivities) => {
            const dateKey = currentDate ? currentDate.toDateString() : '';
            const updatedTimeSlotActivities = (prevActivities[dateKey]?.[selectedTimeSlot] || []).map(
                (activity) =>
                    activity._id === activityId ? { ...activity, completed: true } : activity
            );

            // Recalculer le planning après la mise à jour des activités
            const activitiesForDay = {
                ...prevActivities[dateKey],
                [selectedTimeSlot]: updatedTimeSlotActivities,
            };
            const updatedActivitiesForDay = calculateSchedule(activitiesForDay);

            return {
                ...prevActivities,
                [dateKey]: updatedActivitiesForDay,
            };
        });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.headerContainer, { height: 250 + insets.top }]}>
                    <ImageBackground
                        source={getImageSource()}
                        style={[styles.headerBackground, { paddingTop: insets.top }]}
                        resizeMode="cover"
                    >
                        <View style={styles.overlay} />
                        <Text style={styles.welcomeText}>Bienvenue, {userName || 'Invité'} !</Text>
                        {currentDate && <Text style={styles.countdownText}>{countdown}</Text>}
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={clearLocalStorage}
                        >
                            <Text style={styles.resetButtonText}>Réinitialiser</Text>
                        </TouchableOpacity>
                    </ImageBackground>
                </View>
                <View style={styles.content}>
                    {!isTripPlanned && (
                        <Button
                            title="Planifiez votre séjour magique"
                            onPress={handlePlanTrip}
                            buttonStyle={styles.planTripButton}
                            titleStyle={styles.planTripButtonText}
                        />
                    )}
                    {isTripPlanned && (
                        <>
                            <View style={styles.tripContainer}>
                                <View style={styles.dateNavigator}>
                                    <TouchableOpacity
                                        onPress={handlePreviousDay}
                                        disabled={
                                            availableDates.findIndex(
                                                (date) => date.toDateString() === currentDate?.toDateString()
                                            ) === 0
                                        }
                                    >
                                        <Image
                                            source={require('../assets/icons/left-arrow.png')}
                                            style={styles.arrowIcon}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.currentDateText}>
                                        {currentDate?.toLocaleDateString()}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleNextDay}
                                        disabled={
                                            availableDates.findIndex(
                                                (date) => date.toDateString() === currentDate?.toDateString()
                                            ) === availableDates.length - 1
                                        }
                                    >
                                        <Image
                                            source={require('../assets/icons/right-arrow.png')}
                                            style={styles.arrowIcon}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.timeSlotContainer}>
                                    {timeSlots.map((slot) => (
                                        <TouchableOpacity
                                            key={slot}
                                            style={[
                                                styles.timeSlotButton,
                                                selectedTimeSlot === slot && styles.selectedTimeSlotButton,
                                            ]}
                                            onPress={() => setSelectedTimeSlot(slot)}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeSlotButtonText,
                                                    selectedTimeSlot === slot && styles.selectedTimeSlotButtonText,
                                                ]}
                                            >
                                                {slot === 'morning'
                                                    ? 'Matin'
                                                    : slot === 'afternoon'
                                                        ? 'Après-midi'
                                                        : 'Soir'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <ActivityList
                                activities={
                                    (activities[currentDate ? currentDate.toDateString() : ''] || {})[
                                        selectedTimeSlot
                                        ] || []
                                }
                                currentDate={currentDate}
                                availableDates={availableDates}
                                onDragEnd={({ data }) =>
                                    setActivities({
                                        ...activities,
                                        [currentDate ? currentDate.toDateString() : '']: {
                                            ...(activities[currentDate ? currentDate.toDateString() : ''] || {}),
                                            [selectedTimeSlot]: data,
                                        },
                                    })
                                }
                                toggleActivityDone={(activity) => {
                                    setActivities((prevActivities) => {
                                        const dateKey = currentDate ? currentDate.toDateString() : '';
                                        const timeSlotActivities =
                                            prevActivities[dateKey]?.[selectedTimeSlot] || [];
                                        const updatedActivities = timeSlotActivities.map((act) => {
                                            if (act._id === activity._id) {
                                                return { ...act, done: !act.done };
                                            }
                                            return act;
                                        });
                                        return {
                                            ...prevActivities,
                                            [dateKey]: {
                                                ...(prevActivities[dateKey] || {}),
                                                [selectedTimeSlot]: updatedActivities,
                                            },
                                        };
                                    });
                                }}
                                handleDeleteActivity={(activity) => {
                                    setActivities((prevActivities) => {
                                        const dateKey = currentDate ? currentDate.toDateString() : '';
                                        const timeSlotActivities =
                                            prevActivities[dateKey]?.[selectedTimeSlot] || [];
                                        const updatedActivities = timeSlotActivities.filter(
                                            (act) => act._id !== activity._id
                                        );
                                        return {
                                            ...prevActivities,
                                            [dateKey]: {
                                                ...(prevActivities[dateKey] || {}),
                                                [selectedTimeSlot]: updatedActivities,
                                            },
                                        };
                                    });
                                }}
                                getImageForActivity={getImageForActivity}
                                onLongPress={handleLongPress}
                                onCompleteActivity={handleCompleteActivity}
                            />
                            <Button
                                title="Modifier votre voyage"
                                onPress={() => setShowModal(true)}
                                buttonStyle={styles.modifyTripButton}
                                titleStyle={styles.modifyTripButtonText}
                            />
                        </>
                    )}
                    <AttractionDetailsModal
                        visible={isAttractionModalVisible}
                        attraction={selectedAttraction}
                        onClose={() => setAttractionModalVisible(false)}
                    />
                    <TripPlanModal
                        visible={showModal}
                        onClose={() => setShowModal(false)}
                        onSave={handleSaveTrip}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        duration={duration}
                        setDuration={setDuration}
                        hasExtraMagicHours={hasExtraMagicHours}
                        setHasExtraMagicHours={setHasExtraMagicHours}
                    />
                    <ActivityModal
                        isVisible={isActivityModalVisible}
                        categories={categories}
                        activities={
                            selectedCategoryIndex === 0
                                ? attractions.filter((attraction) =>
                                    isAttractionAvailable(attraction, availableDates)
                                )
                                : selectedCategoryIndex === 1
                                    ? shows.filter((show) =>
                                        isAttractionAvailable(show, availableDates)
                                    )
                                    : restaurants.filter((restaurant) =>
                                        isAttractionAvailable(restaurant, availableDates)
                                    )
                        }
                        selectedCategoryIndex={selectedCategoryIndex}
                        setSelectedCategoryIndex={setSelectedCategoryIndex}
                        selectedActivities={selectedActivitiesInModal || []}
                        onSelectActivity={(activity) => {
                            if (selectedActivitiesInModal.some((a) => a._id === activity._id)) {
                                setSelectedActivitiesInModal((prev) =>
                                    prev.filter((a) => a._id !== activity._id)
                                );
                            } else {
                                setSelectedActivitiesInModal((prev) => [...prev, activity]);
                            }
                        }}
                        onConfirm={() => {
                            if (!currentDate) {
                                console.error('currentDate is null');
                                return;
                            }
                            setActivities((prevActivities) => {
                                const dateKey = currentDate.toDateString();
                                const existingActivities =
                                    prevActivities[dateKey]?.[selectedTimeSlot] || [];
                                const existingIds = existingActivities.map((a) => a._id);

                                const newActivities = selectedActivitiesInModal
                                    .filter((activity) => !existingIds.includes(activity._id))
                                    .map((activity) => ({
                                        ...activity,
                                        done: false,
                                        category: categories[selectedCategoryIndex],
                                    }));

                                return {
                                    ...prevActivities,
                                    [dateKey]: {
                                        ...(prevActivities[dateKey] || {}),
                                        [selectedTimeSlot]: [...existingActivities, ...newActivities],
                                    },
                                };
                            });
                            setSelectedActivitiesInModal([]);
                            setActivityModalVisible(false);
                        }}
                        dataLoaded={dataLoaded}
                        onClose={() => setActivityModalVisible(false)}
                        getImageForActivity={getImageForActivity}
                        scheduledActivities={
                            currentDate
                                ? activities[currentDate.toDateString()]?.[selectedTimeSlot] || []
                                : []
                        }
                        availableDates={availableDates}
                        selectedTimeSlot={selectedTimeSlot}
                    />
                </View>
            </ScrollView>
            {isTripPlanned && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setActivityModalVisible(true)}
                >
                    <Image source={require('../assets/icons/add.png')} style={styles.fabIcon} />
                </TouchableOpacity>
            )}
            <BottomNav navigation={navigation} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerContainer: {
        width: '100%',
    },
    headerBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    countdownText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    resetButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        padding: 15,
        backgroundColor: '#E74C3C',
        borderRadius: 10,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    planTripButton: {
        backgroundColor: '#3498DB',
        borderRadius: 8,
        paddingVertical: 12,
        marginHorizontal: 20,
        elevation: 2,
    },
    planTripButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    tripContainer: {
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        marginTop: -20,
        backgroundColor: '#FFFFFF',
    },
    dateNavigator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E9F7FE',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#D4E6F1',
    },
    arrowIcon: {
        width: 30,
        height: 30,
        tintColor: '#3498DB',
    },
    currentDateText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333333',
        textAlign: 'center',
        flex: 1,
    },
    timeSlotContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    timeSlotButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
    },
    selectedTimeSlotButton: {
        backgroundColor: '#3498DB',
    },
    timeSlotButtonText: {
        fontSize: 16,
        color: '#555555',
    },
    selectedTimeSlotButtonText: {
        color: '#FFFFFF',
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3498DB',
        justifyContent: 'center',
        alignItems: 'center',
        right: 20,
        bottom: 100,
        elevation: 5,
    },
    fabIcon: {
        width: 24,
        height: 24,
        tintColor: 'white',
    },
    modifyTripButton: {
        backgroundColor: '#3498DB',
        borderRadius: 8,
        paddingVertical: 12,
        marginHorizontal: 20,
        elevation: 2,
        marginTop: 10,
    },
    modifyTripButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
});

export default HomeScreen;
