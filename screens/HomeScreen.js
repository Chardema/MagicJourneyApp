// HomeScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {
    View,
    Text,
    ScrollView,
    Button,
    StyleSheet,
    Dimensions,
    Alert,
    SafeAreaView,
    Image,
} from 'react-native';
import BottomNav from "../components/mobileNavbar";
import { setFavorites, toggleFavorite } from "../redux/actions/actions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavoriteCard from "../components/FavoriteCard";
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
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
    const [visitDate, setVisitDate] = useState(null);
    const [userResponses, setUserResponses] = useState({}); // Ajouter cet état
    const [characterMeetTimes, setCharacterMeetTimes] = useState(null);

    const isReturningVisitor = userResponses?.visitedDisney === 'Oui';

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

    // Charger les réponses du questionnaire et la date de visite
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedResponses = await AsyncStorage.getItem('userResponses');
                if (storedResponses) {
                    const parsedResponses = JSON.parse(storedResponses);
                    setUserResponses(parsedResponses);

                    // Charger la date de visite si elle existe
                    if (parsedResponses.visitDate) {
                        const date = new Date(parsedResponses.visitDate);
                        date.setHours(8, 30, 0, 0);
                        setVisitDate(date);
                    }

                    // Charger les horaires de rencontre des personnages si nécessaire
                    if (parsedResponses.parkStyle === 'Rencontre personnage') {
                        // Exemple d'horaires de rencontre des personnages
                        setCharacterMeetTimes(['10:00', '12:00', '14:00', '16:00']);
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données utilisateur:", error);
            }
        };
        loadUserData();
    }, []);

    // Fonction pour enregistrer pour les notifications push
    async function registerForPushNotificationsAsync() {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            alert('Activez les notifications dans les paramètres !');
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

    // Fonctions pour afficher des sections spécifiques
    const renderVisitCount = () => {
        if (userResponses.visitCount) {
            return (
                <View>
                    <Text style={styles.question}>
                        Vous êtes venu {userResponses.visitCount} fois au parc !
                    </Text>
                </View>
            );
        }
        return null;
    };

    const renderAnnualPassInfo = () => {
        if (userResponses.annualPass && userResponses.annualPass !== 'Non') {
            let passImage;
            let advantages;

            switch (userResponses.annualPass) {
                case 'Magic Flex':
                    passImage = require('../assets/bronze.jpg');
                    advantages = 'Accès 300 jours/an, réduction sur les boutiques et restaurants.';
                    break;
                case 'Magic Plus':
                    passImage = require('../assets/argent.jpg');
                    advantages = 'Accès 350 jours/an, réductions et parking gratuit.';
                    break;
                case 'Infinity':
                    passImage = require('../assets/gold.jpg');
                    advantages = 'Accès 365 jours/an, réservations privilèges, réductions premium.';
                    break;
            }

            return (
                <View style={styles.passContainer}>
                    <Image source={passImage} style={styles.passImage} />
                    <Text style={styles.passText}>{advantages}</Text>
                    <Text style={styles.passText}>Prochaine soirée pass annuel : 15 octobre 2024</Text>
                </View>
            );
        }
        return null;
    };

    const renderCharacterMeetTimes = () => {
        if (userResponses.parkStyle === 'Rencontre personnage' && characterMeetTimes) {
            return (
                <View style={styles.meetTimesContainer}>
                    <Text style={styles.question}>Horaires des rencontres personnages :</Text>
                    {characterMeetTimes.map((time, index) => (
                        <Text key={index} style={styles.timeText}>{time}</Text>
                    ))}
                </View>
            );
        }
        return null;
    };

    const renderFarnienteMessage = () => {
        if (userResponses.parkStyle === 'Farniente') {
            return (
                <View style={styles.farnienteContainer}>
                    <Text style={styles.farnienteText}>Profite bien de ta prochaine journée !</Text>
                </View>
            );
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.homePage}>
            {width > 768 && <Navbar />}
            <View style={styles.content}>
                {/* Afficher le compte à rebours pour les nouveaux visiteurs */}
                {!isReturningVisitor && visitDate && (
                    <View style={styles.countdownContainer}>
                        <Text style={styles.countdownTitle}>Votre visite est dans :</Text>
                        <CountdownTimer targetDate={visitDate} />
                    </View>
                )}

                {/* Afficher des informations spécifiques pour les visiteurs réguliers */}
                {isReturningVisitor && (
                    <View>
                        {renderVisitCount()}
                        {renderAnnualPassInfo()}
                        {renderCharacterMeetTimes()}
                        {renderFarnienteMessage()}
                    </View>
                )}

                {/* Afficher les favoris pour tous les utilisateurs */}
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
    question: {
        fontSize: 18,
        marginVertical: 10,
        textAlign: 'center',
        color: '#333',
        fontWeight: 'bold',
    },
    passContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    passImage: {
        width: 150,
        height: 100,
        resizeMode: 'contain',
    },
    passText: {
        fontSize: 16,
        marginVertical: 5,
        textAlign: 'center',
    },
    meetTimesContainer: {
        marginVertical: 20,
    },
    timeText: {
        fontSize: 16,
        marginVertical: 5,
        textAlign: 'center',
    },
    farnienteContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    mickeyImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    farnienteText: {
        fontSize: 18,
        marginTop: 10,
        textAlign: 'center',
    },
    countdownContainer: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    countdownTitle: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    countdownText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
});

export default HomeScreen;
