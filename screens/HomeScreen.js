// HomeScreen.js

import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    Text,
    Image,
    ImageBackground,
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
import AttractionDetailsModal from '../components/AttractionsDetailsModal';
import { Button } from 'react-native-elements';
import {
    attractionImages,
    normalizeName,
    restaurantImagesMap,
    showImagesMap,
} from '../components/utils';
import BottomNav from '../components/mobileNavbar';

const HomeScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const [userName, setUserName] = useState('');
    const [showModal, setShowModal] = useState(false);
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

    const categories = ['Attractions', 'Shows', 'Restaurants'];
    const attractions = useSelector((state) => state.attractions.attractions) || [];
    const shows = useSelector((state) => state.shows.shows) || [];
    const restaurants = useSelector((state) => state.restaurants.restaurants) || [];
    const waitTimes = useSelector((state) => state.waitTimes) || {};

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
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données utilisateur:', error);
            }
        };
        loadUserData();
    }, []);

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
            });
        }
    }, [activities, isTripPlanned, startDate, availableDates, currentDate]);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            let targetTime;

            if (startDate) {
                targetTime = new Date(startDate);
                targetTime.setHours(0, 0, 0, 0); // Définir l'heure à minuit
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
            const activitiesForDate = prevActivities[dateKey] || [];

            const updatedActivities = activitiesForDate.map((activity) => {
                const updatedWaitTime = waitTimes[activity._id];
                return {
                    ...activity,
                    waitTime: updatedWaitTime !== undefined ? updatedWaitTime : activity.waitTime,
                };
            });

            return {
                ...prevActivities,
                [dateKey]: updatedActivities,
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

            saveTripData({
                activities,
                isTripPlanned: true,
                startDate: startDate ? startDate.toISOString() : null,
                availableDates: dates.map((date) => date.toISOString()),
                currentDate: dates[0] ? dates[0].toISOString() : null,
            });
        }

        setIsTripPlanned(true);
        setShowModal(false);
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

    return (
        <SafeAreaView style={styles.homePage}>
            <View style={styles.headerContainer}>
                <ImageBackground
                    source={require('../assets/BigThunderMountain.jpg')}
                    style={styles.headerBackground}
                    resizeMode="cover"
                >
                    <View style={styles.overlay} />
                    <Text style={styles.welcomeText}>Bienvenue, {userName || 'Invité'} !</Text>
                    {currentDate && <Text style={styles.countdownText}>{countdown}</Text>}
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
                        </View>
                        <ActivityList
                            activities={activities[currentDate ? currentDate.toDateString() : ''] || []}
                            currentDate={currentDate}
                            onDragEnd={({ data }) =>
                                setActivities({
                                    ...activities,
                                    [currentDate ? currentDate.toDateString() : '']: data,
                                })
                            }
                            toggleActivityDone={(activity) => {
                                setActivities((prevActivities) => {
                                    const dateKey = currentDate ? currentDate.toDateString() : '';
                                    const updatedActivities =
                                        prevActivities[dateKey]?.map((act) => {
                                            if (act._id === activity._id) {
                                                return { ...act, done: !act.done };
                                            }
                                            return act;
                                        }) || [];
                                    return { ...prevActivities, [dateKey]: updatedActivities };
                                });
                            }}
                            handleDeleteActivity={(activity) => {
                                setActivities((prevActivities) => {
                                    const dateKey = currentDate ? currentDate.toDateString() : '';
                                    const updatedActivities =
                                        prevActivities[dateKey]?.filter((act) => act._id !== activity._id) ||
                                        [];
                                    return { ...prevActivities, [dateKey]: updatedActivities };
                                });
                            }}
                            getImageForActivity={getImageForActivity}
                            onLongPress={handleLongPress}
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
                />
                <ActivityModal
                    isVisible={isActivityModalVisible}
                    categories={categories}
                    activities={
                        selectedCategoryIndex === 0
                            ? attractions
                            : selectedCategoryIndex === 1
                                ? shows
                                : restaurants
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
                            const existingActivities = prevActivities[dateKey] || [];
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
                                [dateKey]: [...existingActivities, ...newActivities],
                            };
                        });
                        setSelectedActivitiesInModal([]);
                        setActivityModalVisible(false);
                    }}
                    dataLoaded={dataLoaded}
                    onClose={() => setActivityModalVisible(false)}
                    getImageForActivity={getImageForActivity}
                    scheduledActivities={
                        currentDate ? activities[currentDate.toDateString()] || [] : []
                    }
                />
            </View>
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
    homePage: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerContainer: {
        width: '100%',
        height: 200,
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
    content: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
        paddingBottom: 100,
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        marginTop: -20,
    },
    countdownText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
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
    parkHoursContainer: {
        marginVertical: 20,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3498DB',
        marginBottom: 10,
    },
    parkSection: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
    },
    parkName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3498DB',
        marginBottom: 5,
    },
    parkTimezone: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 5,
    },
    parkScheduleTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 5,
    },
    parkHoursText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'left',
        paddingHorizontal: 10,
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
});

export default HomeScreen;
