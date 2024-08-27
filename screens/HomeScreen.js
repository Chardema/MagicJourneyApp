import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { View, Text, ScrollView, Button, StyleSheet, Dimensions, Alert } from 'react-native';
import Navbar from "../components/Navbar";
import BottomNav from "../components/mobileNavbar";
import PopupSurvey from '../components/PopupSurvey';
import LoadingScreen from "../components/LoadingScreen";
import { setFavorites, toggleFavorite } from "../redux/actions/actions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavoriteCard from "../components/FavoriteCard";


const HomeScreen = () => {
    const [isLoading, setIsLoading] = useState(true);

    const reduxFavorites = useSelector(state => state.favorites.favorites);
    const attractions = useSelector(state => state.attractions.attractions);

    if (!reduxFavorites || !Array.isArray(reduxFavorites)) return null;
    if (!attractions || !Array.isArray(attractions)) return null;

    const dispatch = useDispatch();
    const { width } = Dimensions.get('window');
    const [showPopup, setShowPopup] = useState(false);
    const [favoritesFilter, setFavoritesFilter] = useState('all');
    const [filteredFavorites, setFilteredFavorites] = useState(reduxFavorites);
    const [isMinimalistMode, setIsMinimalistMode] = useState(false);

    const toggleViewMode = () => setIsMinimalistMode(!isMinimalistMode);

    const updateFavorites = useCallback((favorites, attractions) => {
        return favorites.map(favorite => {
            const updatedAttraction = attractions.find(attr => attr._id === favorite._id);
            return updatedAttraction ? { ...favorite, waitTime: updatedAttraction.waitTime, status: updatedAttraction.status } : favorite;
        });
    }, []);

    const removeFavorite = useCallback((favorite) => {
        Alert.alert(
            "Supprimer des favoris",
            `Voulez-vous vraiment supprimer ${favorite.name} de vos favoris ?`,
            [
                { text: "Annuler" },
                { text: "Supprimer", onPress: () => dispatch(setFavorites(reduxFavorites.filter(fav => fav._id !== favorite._id))) }
            ]
        );
    }, [dispatch, reduxFavorites]);

    const handleToggleFavorite = async (attractionId) => {
        try {
            dispatch(toggleFavorite(attractionId));
            const updatedFavorites = await AsyncStorage.getItem('favorites');
            console.log("Après l'ajout au favori:", JSON.parse(updatedFavorites));
        } catch (error) {
            console.error("Erreur lors de l'ajout aux favoris:", error);
        }
    };

    useEffect(() => {
        const updatedFavorites = updateFavorites(reduxFavorites, attractions);
        if (JSON.stringify(updatedFavorites) !== JSON.stringify(reduxFavorites)) {
            dispatch(setFavorites(updatedFavorites));
        }
    }, [attractions, dispatch, reduxFavorites, updateFavorites]);

    useEffect(() => {
        if (reduxFavorites.length > 0) {
            setFilteredFavorites(reduxFavorites.filter(favorite => {
                if (favoritesFilter === 'all') return true;
                if (favoritesFilter === 'attractions') return favorite.type !== 'SHOW';
                return favorite.type === 'SHOW';
            }));
        }
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
                    <View style={styles.content}>
                        {filteredFavorites.length > 0 ? (
                            <ScrollView>
                                <View style={styles.attractionsSection}>
                                    {filteredFavorites.map(favorite => (
                                        <FavoriteCard
                                            key={`${favorite._id}-${favorite.name}`}
                                            favorite={favorite}
                                            onRemove={removeFavorite}
                                            onToggleFavorite={handleToggleFavorite}
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
        backgroundColor: '#f5f5f5',
        paddingTop: 20,
    },
    topContainer: {
        paddingHorizontal: 15,
    },
    filterButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    bottomContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    attractionsSection: {
        marginTop: 15,
    },
    noFavoritesMessage: {
        alignItems: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
});

export default HomeScreen;
