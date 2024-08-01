// screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { View, Text, Image, ScrollView, Button, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Navbar from "../components/Navbar";
import BottomNav from "../components/mobileNavbar";
import PopupSurvey from '../components/PopupSurvey';
import LoadingScreen from "../components/LoadingScreen";
import { setFavorites } from "../redux/actions/actions";
import { attractionImages } from "./AttractionsScreen";
import { formatImageName, importImage } from '../components/utils';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
const backgroundImage = require('../assets/disneyete2024.jpg');
import ModalAttractions from "../components/ModalAttractions";

const getWaitTimeColor = (attraction) => {
    if (attraction.status === 'CLOSED' || attraction.status === 'DOWN') {
        return 'gray';
    } else if (attraction.waitTime <= 15) {
        return 'green';
    } else if (attraction.waitTime <= 30) {
        return 'yellow';
    } else {
        return 'red';
    }
};

const FavoriteCard = ({ favorite, onRemove, isMinimalistMode }) => {
    const [nextShowtime, setNextShowtime] = useState(null);
    const dispatch = useDispatch();
    const favorites = useSelector(state => state.favorites.favorites);

    useEffect(() => {
        if (favorite.type === 'SHOW' && favorite.showtimes) {
            const now = new Date();
            const futureShowtimes = favorite.showtimes.filter(showtime =>
                new Date(showtime.startTime) > now
            ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            setNextShowtime(futureShowtimes.length > 0 ? futureShowtimes[0] : null);
        }
    }, [favorite]);

    const handleToggleFavorite = () => {
        dispatch(toggleFavorite(favorite));
    };

    const isFavorite = favorites.some(fav => fav.id === favorite.id);

    return (
        <TouchableOpacity
            onLongPress={() => onRemove(favorite)}
            style={[styles.attractionsCard, isMinimalistMode && styles.minimalistModeCard]}
        >
            {!isMinimalistMode && favorite.type === 'SHOW' && (
                <>
                    <Image style={styles.favoriteImage} source={importImage(formatImageName(favorite.name))} />
                    <Text style={styles.attractionTitle}>{favorite.name}</Text>
                    {nextShowtime ? (
                        <Text>Prochaine représentation : {new Date(nextShowtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    ) : (
                        <Text>Non disponible</Text>
                    )}
                </>
            )}
            {!isMinimalistMode && favorite.type !== 'SHOW' && (
                <>
                    <Image source={attractionImages[favorite.name]} style={styles.favoriteImage} />
                    <Text style={styles.attractionTitle}>{favorite.name}</Text>
                    <View style={styles.waitTimeContainer}>
                        <View style={[styles.waitTimeCircle, styles[getWaitTimeColor(favorite)]]}>
                            <Text>
                                {favorite.status === 'CLOSED' ? 'Fermée' :
                                    favorite.status === 'DOWN' ? 'Indispo' :
                                        favorite.waitTime === null ? 'Direct' : `${favorite.waitTime} min`}
                            </Text>
                        </View>
                    </View>
                </>
            )}
            {isMinimalistMode && (
                <>
                    <Text style={styles.attractionTitle}>{favorite.name}</Text>
                    {favorite.type !== 'SHOW' ? (
                        <View style={styles.waitTimeContainer}>
                            <View style={[styles.waitTimeCircle, styles[getWaitTimeColor(favorite)]]}>
                                <Text>
                                    {favorite.status === 'CLOSED' ? 'Fermée' :
                                        favorite.status === 'DOWN' ? 'Indispo' :
                                            favorite.waitTime === null ? 'Direct' : `${favorite.waitTime} min`}
                                </Text>
                            </View>
                            <Button title="+ d'infos" onPress={() => {}} />
                        </View>
                    ) : nextShowtime ? (
                        <Text>Prochaine représentation : {new Date(nextShowtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    ) : (
                        <Text>Non disponible</Text>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const HomeScreen = () => {
    const [isLoading, setIsLoading] = useState(true);
    const reduxFavorites = useSelector(state => state.favorites.favorites);
    const attractions = useSelector(state => state.attractions.attractions);
    const dispatch = useDispatch();
    const { width } = Dimensions.get('window');
    const [showPopup, setShowPopup] = useState(false);
    const [favoritesFilter, setFavoritesFilter] = useState('all');
    const [filteredFavorites, setFilteredFavorites] = useState(reduxFavorites);
    const [isMinimalistMode, setIsMinimalistMode] = useState(false);

    const toggleViewMode = () => setIsMinimalistMode(!isMinimalistMode);

    const updateFavorites = useCallback((favorites, attractions) => {
        return favorites.map(favorite => {
            const updatedAttraction = attractions.find(attr => attr.id === favorite.id);
            return updatedAttraction ? { ...favorite, waitTime: updatedAttraction.waitTime, status: updatedAttraction.status } : favorite;
        });
    }, []);

    const removeFavorite = useCallback((favorite) => {
        Alert.alert(
            "Supprimer des favoris",
            `Voulez-vous vraiment supprimer ${favorite.name} de vos favoris ?`,
            [
                { text: "Annuler" },
                { text: "Supprimer", onPress: () => dispatch(setFavorites(reduxFavorites.filter(fav => fav.id !== favorite.id))) }
            ]
        );
    }, [dispatch, reduxFavorites]);

    useEffect(() => {
        const updatedFavorites = updateFavorites(reduxFavorites, attractions);
        if (JSON.stringify(updatedFavorites) !== JSON.stringify(reduxFavorites)) {
            dispatch(setFavorites(updatedFavorites));
        }
    }, [attractions, dispatch, reduxFavorites, updateFavorites]);

    useEffect(() => {
        setFilteredFavorites(reduxFavorites.filter(favorite => {
            if (favoritesFilter === 'all') return true;
            if (favoritesFilter === 'attractions') return favorite.type !== 'SHOW';
            return favorite.type === 'SHOW';
        }));
    }, [favoritesFilter, reduxFavorites]);

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const userPreferences = await AsyncStorage.getItem('@user_preferences');
                if (!userPreferences) {
                    setShowPopup(true);
                }
            } catch (e) {
                console.error(e);
            }
        };

        loadPreferences();
    }, []);

    const closePopup = () => setShowPopup(false);

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    return (
        <>
            {isLoading ? (
                <LoadingScreen onLoadingComplete={handleLoadingComplete} />
            ) : (
                <View style={styles.homePage}>
                    {width > 768 && <Navbar />}
                    <ScrollView style={styles.topContainer}>
                        <View style={styles.heroSection}>
                            <Image source={backgroundImage} style={styles.heroImage} />
                        </View>
                        <View style={styles.filterButtons}>
                            <Button onPress={() => setFavoritesFilter('all')} title="Tous" color={favoritesFilter === 'all' ? "blue" : "gray"} />
                            <Button onPress={() => setFavoritesFilter('attractions')} title="Attractions" color={favoritesFilter === 'attractions' ? "blue" : "gray"} />
                            <Button onPress={() => setFavoritesFilter('shows')} title="Spectacles" color={favoritesFilter === 'shows' ? "blue" : "gray"} />
                        </View>
                    </ScrollView>
                    <View style={styles.bottomContainer}>
                        <View style={styles.toggleButtons}>
                            <TouchableOpacity onPress={() => setIsMinimalistMode(true)} style={[styles.toggleButton, isMinimalistMode && styles.active]}>
                                <Icon name="list" size={24} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsMinimalistMode(false)} style={[styles.toggleButton, !isMinimalistMode && styles.active]}>
                                <Icon name="th-large" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.content}>
                            {filteredFavorites.length > 0 ? (
                                <ScrollView>
                                    <View style={styles.attractionsSection}>
                                        {filteredFavorites.map(favorite => (
                                            <FavoriteCard
                                                key={`${favorite.id}-${favorite.name}`}
                                                favorite={favorite}
                                                onRemove={removeFavorite}
                                                isMinimalistMode={isMinimalistMode}
                                            />
                                        ))}
                                    </View>
                                </ScrollView>
                            ) : (
                                <View style={styles.noFavoritesMessage}>
                                    <Text>Vous n'avez pas encore de favoris.</Text>
                                    <Button onPress={() => setShowPopup(true)} title="Refaire le quiz" />
                                </View>
                            )}
                        </View>
                        <View style={styles.buyMeABeerContainer}>
                            <Text>Cette application n'a aucune affiliation officielle avec Disneyland Paris {"\n"}
                                N'hésitez pas à me soutenir !</Text>
                            <Button
                                title="Buy me a beer"
                                onPress={() => Linking.openURL("https://www.buymeacoffee.com/8w7bkbktqs4")}
                                color="#5F7FFF"
                            />
                        </View>
                    </View>
                    {width <= 768 && <BottomNav />}
                    {showPopup && <PopupSurvey onClose={closePopup} attractions={attractions} />}
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    homePage: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative',
    },
    topContainer: {
        flex: 1,
    },
    heroSection: {
        height: 200,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    filterButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    bottomContainer: {
        flex: 2,
    },
    toggleButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    toggleButton: {
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    active: {
        backgroundColor: '#5F7FFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 10,
    },
    attractionsSection: {
        marginVertical: 10,
    },
    attractionsCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 2,
    },
    minimalistModeCard: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    favoriteImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    attractionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    waitTimeContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    waitTimeCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    green: {
        backgroundColor: 'green',
    },
    yellow: {
        backgroundColor: 'yellow',
    },
    red: {
        backgroundColor: 'red',
    },
    gray: {
        backgroundColor: 'gray',
    },
    noFavoritesMessage: {
        alignItems: 'center',
        marginTop: 20,
    },
    buyMeABeerContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
});

export default HomeScreen;
