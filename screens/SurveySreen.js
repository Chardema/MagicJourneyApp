import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics'; // Importer expo-haptics

const VisitSurveyPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState({});
    const [date, setDate] = useState(null);  // Initialiser avec null pour ne rien afficher par défaut
    const [showDatePicker, setShowDatePicker] = useState(false);
    const navigation = useNavigation();

    const handleAnswer = useCallback((answer, type) => {
        // Déclencher un retour haptique lors du clic sur les boutons de réponse
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (type === 'visitDate') {
            setShowDatePicker(true);
        } else {
            setResponses(current => {
                const updatedResponses = { ...current, [type]: answer };

                if (type === 'planningToVisit' && answer === 'Non') {
                    AsyncStorage.setItem('userPreferences', JSON.stringify(updatedResponses)).then(() => {
                        navigation.navigate('MainTabs', { screen: 'HomeScreen' });
                    });
                } else {
                    setCurrentStep(prev => prev + 1);
                }

                return updatedResponses;
            });
        }
    }, [navigation]);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleConfirm = () => {
        // Déclencher un retour haptique lors de la confirmation
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setResponses(current => {
            const fixedDate = new Date(date);
            fixedDate.setHours(8);
            fixedDate.setMinutes(30);
            fixedDate.setSeconds(0);
            fixedDate.setMilliseconds(0);

            const updatedResponses = { ...current, visitDate: fixedDate.toISOString() };
            AsyncStorage.setItem('userPreferences', JSON.stringify(updatedResponses)).then(() => {
                navigation.navigate('MainTabs', { screen: 'HomeScreen' });
            });
            AsyncStorage.setItem('visitDate', fixedDate.toISOString());
            return updatedResponses;
        });
    };

    const getProgress = () => {
        const steps = 3;  // Total number of steps
        return (currentStep + 1) / steps * 100;
    };

    return (
        <View style={styles.pageContainer}>
            <Image source={require('../assets/viewingarea.jpg')} style={styles.headerImage} />

            <View style={styles.contentContainer}>
                {currentStep === 0 && (
                    <>
                        <Text style={styles.question}>Avez-vous déjà visité Disneyland Paris ?</Text>
                        <TouchableOpacity
                            onPress={() => handleAnswer('Oui', 'visitedDisney')}
                            style={styles.answerButton}
                        >
                            <Text style={styles.buttonText}>Oui</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleAnswer('Non', 'visitedDisney')}
                            style={styles.answerButton}
                        >
                            <Text style={styles.buttonText}>Non</Text>
                        </TouchableOpacity>
                    </>
                )}

                {currentStep === 1 && responses.visitedDisney === 'Non' && (
                    <>
                        <Text style={styles.question}>Prévoyez-vous de venir sur le parc bientôt ?</Text>
                        <TouchableOpacity
                            onPress={() => handleAnswer('Oui', 'planningToVisit')}
                            style={styles.answerButton}
                        >
                            <Text style={styles.buttonText}>Oui</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleAnswer('Non', 'planningToVisit')}
                            style={styles.answerButton}
                        >
                            <Text style={styles.buttonText}>Non</Text>
                        </TouchableOpacity>
                    </>
                )}

                {currentStep === 2 && responses.planningToVisit === 'Oui' && (
                    <>
                        <Text style={styles.question}>Quand prévoyez-vous de venir ?</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Retour haptique pour le bouton date
                                setShowDatePicker(true);
                            }}
                        >
                            <FontAwesome name="calendar" size={20} color="#FFF" />
                            <Text style={styles.datePickerButtonText}>Choisir une date</Text>
                        </TouchableOpacity>

                        {date && (
                            <Text style={styles.selectedDateText}>
                                {date.toLocaleDateString()}
                            </Text>
                        )}

                        <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>Confirmer</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Modal for Date Picker */}
                <Modal
                    transparent={true}
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.datePickerContainer}>
                            <DateTimePicker
                                value={date || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                            <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.modalCloseButton}>
                                <Text style={styles.modalCloseButtonText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${getProgress()}%` }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Styles existants
    pageContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerImage: {
        width: '100%',
        height: '30%',
        resizeMode: 'cover',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        marginTop: -20,
    },
    question: {
        fontSize: 20,
        marginVertical: 20,
        textAlign: 'center',
        color: '#333',
        fontWeight: 'bold',
    },
    answerButton: {
        backgroundColor: '#FF6F61',
        padding: 15,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    datePickerButton: {
        backgroundColor: '#4A90E2',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginVertical: 10,
    },
    datePickerButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 10,
    },
    selectedDateText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
        marginTop: 10,
    },
    confirmButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    datePickerContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCloseButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#FF6F61',
        borderRadius: 5,
    },
    modalCloseButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
        marginTop: 30,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FF6F61',
    },
});

export default VisitSurveyPage;
