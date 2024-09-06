import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReturnVisitorPage = () => {
    const [responses, setResponses] = useState({});
    const [characterMeetTimes, setCharacterMeetTimes] = useState(null);
    const [visitDate, setVisitDate] = useState(null); // Stocker la date de visite

    // Chargement des réponses de l'utilisateur depuis AsyncStorage
    useEffect(() => {
        const loadResponses = async () => {
            const storedResponses = await AsyncStorage.getItem('userPreferences');
            if (storedResponses) {
                const parsedResponses = JSON.parse(storedResponses);
                setResponses(parsedResponses);

                // Si une date de visite est présente, la charger
                if (parsedResponses.visitDate) {
                    const visitDate = new Date(parsedResponses.visitDate);
                    setVisitDate(visitDate);
                }
            }
        };
        loadResponses();
    }, []);

    // Fonction pour charger les horaires de rencontre des personnages (exemple)
    useEffect(() => {
        if (responses.parkStyle === 'Rencontre personnage') {
            setCharacterMeetTimes(['10:00', '12:00', '14:00', '16:00']);
        }
    }, [responses]);

    // Composant pour afficher les informations du pass annuel
    const renderAnnualPassInfo = () => {
        if (responses.annualPass && responses.annualPass !== 'Non') {
            let passImage;
            let advantages;

            switch (responses.annualPass) {
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

    // Composant pour afficher les informations du nombre de visites
    const renderVisitCount = () => {
        if (responses.visitCount) {
            return (
                <View>
                    <Text style={styles.question}>
                        Vous êtes venu {responses.visitCount} fois au parc !
                    </Text>
                </View>
            );
        }
        return null;
    };

    // Composant pour afficher les horaires de rencontre des personnages
    const renderCharacterMeetTimes = () => {
        if (responses.parkStyle === 'Rencontre personnage' && characterMeetTimes) {
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

    // Composant pour afficher l'image de Mickey et un message pour "Farniente"
    const renderFarnienteMessage = () => {
        if (responses.parkStyle === 'Farniente') {
            return (
                <View style={styles.farnienteContainer}>
                    <Image source={require('../assets/mickey-relax.png')} style={styles.mickeyImage} />
                    <Text style={styles.farnienteText}>Profite bien de ta prochaine journée !</Text>
                </View>
            );
        }
        return null;
    };

    // Composant pour afficher le compte à rebours si une date de visite est présente
    const renderCountdown = () => {
        if (visitDate) {
            return (
                <View style={styles.countdownContainer}>
                    <Text style={styles.question}>Votre prochaine visite est dans :</Text>
                    <CountdownTimer targetDate={visitDate} />
                </View>
            );
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.homePage}>
            <View style={styles.pageContainer}>
                <Text style={styles.title}>Bienvenue à nouveau !</Text>

                {/* Affichage des informations selon les réponses */}
                {renderAnnualPassInfo()}
                {renderVisitCount()}
                {renderCharacterMeetTimes()}
                {renderFarnienteMessage()}

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    homePage: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    pageContainer: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    question: {
        fontSize: 18,
        marginVertical: 10,
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
        marginVertical: 20,
        alignItems: 'center',
    },
});

export default ReturnVisitorPage;
