import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { View, Text,
    ScrollView, Button, StyleSheet, Dimensions, Alert, SafeAreaView } from 'react-native';
import BottomNav from "../components/mobileNavbar";
import { setFavorites, toggleFavorite } from "../redux/actions/actions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavoriteCard from "../components/FavoriteCard";
import
    * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import coutdownTimer from "../components/CoutdownTimer";
import CountdownTimer from "../components/CoutdownTimer";

const HomeScreen = () => {
    const reduxFavorites = useSelector(state => state.favorites.favorites);
    const attractions = useSelector(state => state.attractions.attractions);

    if (!reduxFavorites || !Array.isArray(reduxFavorites)) return null;
    if (!attractions || !Array.isArray(attractions)) return null;

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { width } = Dimensions.get('window');
    const [favoritesFilter, setFavoritesFilter] = useState('all');
    const [filteredFavorites, setFilteredFavorites] = useState(reduxFavorites);
    const [isMinimalistMode, setIsMinimalistMode] = useState(false);
    const [countdown, setCountdown] = useState(null); // État pour le compte à rebours
    const  [visitDate, setVisitDate] = useState(null);

    const toggleViewMode = () => setIsMinimalistMode(!isMinimalistMode);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

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

    // Fonction pour enregistrer pour les notifications push
    async function registerForPushNotificationsAsync() {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            alert('Enable notifications in settings!');
            return;
        }
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token); // Sauvegarde le token pour tester
    }

    // Fonction pour mettre à jour hasLaunched à false
    const setHasLaunchedToFalse = async () => {
        try {
            await AsyncStorage.setItem('hasLaunched', 'false');
            console.log('La valeur de hasLaunched a été mise à jour à false');
        } catch (error) {
            console.error('Erreur lors de la mise à jour de hasLaunched:', error);
        }
    };

    // Vérification du background fetch
    useEffect(() => {
        registerForPushNotificationsAsync();
        const interval = setInterval(() => {
            // Logique pour vérifier les mises à jour des attractions
            console.log('Vérification des changements de temps d\'attente...');
        }, 60000); // Vérifier toutes les 60 secondes

        return () => clearInterval(interval);
    }, []);

    // Récupérer la date de visite et mettre à jour le compte à rebours
    useEffect(() => {
        const getVisitDate = async () => {
            try {
                const visitDateString = await AsyncStorage.getItem('visitDate');
                if (visitDateString) {
                    const visitDate = new Date(visitDateString);
                    visitDate.setHours(8, 30, 0, 0); // Fixer l'heure à 8h30
                    setVisitDate(visitDate);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la date de visite:", error);
            }
        };

        getVisitDate();
    }, []);
    return (
        <SafeAreaView style={styles.homePage}>
            {width > 768 && <Navbar />}
            <View style={styles.content}>
                {/* Afficher le compte à rebours s'il est disponible */}
                {visitDate && <CountdownTimer targetDate={visitDate} />}

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
                    </View>
                )}
                <Button title="Reset Launch" onPress={setHasLaunchedToFalse} />
            </View>
            {width <= 768 && <BottomNav />}
        </SafeAreaView>
    );

};

const styles = StyleSheet.create({
    homePage: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        paddingHorizontal: 15,
    },
    attractionsSection: {
        marginVertical: 10,
    },
    noFavoritesMessage: {
        alignItems: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
    FavoriteCard: {
        marginVertical: 10,
    },
    countdownContainer: {
        backgroundColor: '#333', // Fond sombre pour mettre en valeur le texte
        padding: 10, // Espacement autour du texte
        borderRadius: 10, // Bords arrondis pour un look plus moderne
        marginBottom: 20, // Espacement en bas
        alignItems: 'center', // Centrer le texte horizontalement
    },
    countdownText: {
        fontSize: 24, // Taille de police plus grande pour le texte
        color: '#fff', // Texte blanc pour contraster avec le fond sombre
        fontWeight: 'bold', // Texte en gras pour le rendre plus lisible
        letterSpacing: 1.5, // Espacement entre les lettres pour une meilleure lisibilité
    },
});

export default HomeScreen;
