import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import useParkHours from "../components/hooks/useParkHours"; // Custom hook pour récupérer les heures d'ouverture

const HomeScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [duration, setDuration] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [step, setStep] = useState(1); // Pour gérer les étapes de la planification du séjour
    const [isTripPlanned, setIsTripPlanned] = useState(false);
    const [currentDate, setCurrentDate] = useState(null);
    const parkHours = useParkHours();
    const [availableDates, setAvailableDates] = useState([]);

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
    }, []);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirmDate = (date) => {
        setStartDate(date);
        setStep(2); // Passer à l'étape suivante après la sélection de la date
        hideDatePicker();
    };

    const handleDurationInput = (input) => {
        if (/^\d$/.test(input)) { // Limiter la saisie à un seul chiffre (1-9)
            setDuration(input);
            const days = parseInt(input);
            if (startDate) {
                const calculatedEndDate = new Date(startDate);
                calculatedEndDate.setDate(startDate.getDate() + days - 1); // Calculer la date de fin
                setEndDate(calculatedEndDate);

                // Générer les dates disponibles pour le séjour
                const dates = [];
                for (let i = 0; i < days; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    dates.push(currentDate);
                }
                setAvailableDates(dates);
                setCurrentDate(dates[0]); // Initialiser avec la première date du séjour
            }
        }
    };

    const handleSaveTrip = () => {
        setIsTripPlanned(true); // Marquer le séjour comme planifié
        setShowModal(false);
        setStep(1); // Réinitialiser pour une prochaine utilisation
    };

    const handlePlanTrip = () => {
        setShowModal(true);
        setStep(1); // Commencer par l'étape 1 (sélection de la date)
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

                {/* Bouton pour planifier le séjour */}
                {!isTripPlanned && (
                    <TouchableOpacity
                        onPress={handlePlanTrip}
                        style={styles.planTripButton}
                    >
                        <Text style={styles.buttonText}>Je planifie mon séjour</Text>
                    </TouchableOpacity>
                )}

                {/* Modal pour planifier le séjour */}
                <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowModal(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
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
                                {step === 2 && (
                                    <TouchableOpacity onPress={handleSaveTrip} style={styles.answerButton}>
                                        <Text style={styles.buttonText}>Valider</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Bouton pour fermer le modal */}
                                <TouchableOpacity
                                    style={styles.answerButton}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={styles.buttonText}>Fermer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
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
        paddingTop: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    planTripButton: {
        backgroundColor: '#FF6F61',
        padding: 15,
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    datePickerButton: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
    },
    datePickerText: {
        fontSize: 16,
        color: '#333',
    },
    input: {
        width: '100%',
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        textAlign: 'center',
    },
    dateSummary: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    answerButton: {
        backgroundColor: '#FF6F61',
        padding: 15,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
    },
});

export default HomeScreen;
