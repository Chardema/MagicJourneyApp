import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    SafeAreaView,
    Modal,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { formatTime } from '../components/utils'; // Formatage du temps
import useParkHours from "../components/hooks/useParkHours"; // Custom hook pour récupérer les heures d'ouverture

const HomeScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [duration, setDuration] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [step, setStep] = useState(1);
    const [isTripPlanned, setIsTripPlanned] = useState(false);
    const [currentDate, setCurrentDate] = useState(null); // Pour gérer la date actuellement sélectionnée
    const parkHours = useParkHours(); // Utilisation du hook pour récupérer les horaires du parc
    const [availableDates, setAvailableDates] = useState([]); // Liste des dates disponibles pour le séjour
    const [activities, setActivities] = useState({}); // Stockage des activités par date

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
        setActivities(prevActivities => ({
            ...prevActivities,
            [currentDate.toDateString()]: [...(prevActivities[currentDate.toDateString()] || []), 'Nouvelle activité']
        }));
    };

    const handleNextDay = () => {
        const currentIndex = availableDates.findIndex(date => date.toDateString() === currentDate.toDateString());
        if (currentIndex < availableDates.length - 1) {
            setCurrentDate(availableDates[currentIndex + 1]);
        }
    };

    const handlePreviousDay = () => {
        const currentIndex = availableDates.findIndex(date => date.toDateString() === currentDate.toDateString());
        if (currentIndex > 0) {
            setCurrentDate(availableDates[currentIndex - 1]);
        }
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
                    <Button
                        title="Je planifie mon séjour"
                        onPress={handlePlanTrip}
                        style={styles.planTripButton}
                    />
                )}

                {/* Affichage des dates avec sélecteur de jour */}
                {isTripPlanned && (
                    <View style={styles.tripContainer}>
                        <View style={styles.dateNavigator}>
                            <Button title="←" onPress={handlePreviousDay} disabled={availableDates.findIndex(date => date.toDateString() === currentDate?.toDateString()) === 0} />
                            <Text style={styles.currentDateText}>{currentDate?.toLocaleDateString()}</Text>
                            <Button title="→" onPress={handleNextDay} disabled={availableDates.findIndex(date => date.toDateString() === currentDate?.toDateString()) === availableDates.length - 1} />
                        </View>
                        {/* Afficher les horaires d'ouverture */}
                        {renderScheduleInfo()}
                        {/* Bouton pour ajouter une activité */}
                        <Button title="J'ajoute ma première activité" onPress={addActivity} />
                        {/* Affichage des activités pour le jour sélectionné */}
                        <View style={styles.activitiesContainer}>
                            {activities[currentDate?.toDateString()]?.length > 0 ? (
                                activities[currentDate.toDateString()].map((activity, index) => (
                                    <Text key={index} style={styles.activityText}>{activity}</Text>
                                ))
                            ) : (
                                <Text>Aucune activité pour ce jour.</Text>
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
                            {step === 2 && <Button title="Valider" onPress={handleSaveTrip} />}

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
        marginTop: 20,
        paddingHorizontal: 15,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    planTripButton: {
        marginVertical: 20,
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
        marginTop: 20,
        alignItems: 'center',
    },
    dateNavigator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    currentDateText: {
        fontSize: 18,
        marginHorizontal: 20,
    },
    activitiesContainer: {
        marginTop: 20,
        alignItems: 'center',
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
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        maxHeight: '80%',
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
    closeButton: {
        marginTop: 10,
        backgroundColor: '#FF6F61',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default HomeScreen;
