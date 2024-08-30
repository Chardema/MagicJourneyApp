import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Button } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const PopupSurvey = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState({});
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const navigation = useNavigation();

    const handleAnswer = useCallback((answer, type) => {
        if (type === 'visitDate') {
            setShowDatePicker(true);
        } else {
            setResponses(current => {
                const updatedResponses = { ...current, [type]: answer };

                if (type === 'planningToVisit' && answer === 'Non') {
                    AsyncStorage.setItem('userPreferences', JSON.stringify(updatedResponses));
                    navigation.navigate('HomeScreen');
                    onClose();
                } else {
                    setCurrentStep(prev => prev + 1);
                }

                return updatedResponses;
            });
        }
    }, [navigation, onClose]);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
    };

    const handleConfirm = () => {
        setResponses(current => {
            const updatedResponses = { ...current, visitDate: date.toISOString() };
            AsyncStorage.setItem('userPreferences', JSON.stringify(updatedResponses)).then(() => {
                // Stockage de la date de visite
                AsyncStorage.setItem('visitDate', date.toISOString());

                // Log pour vérifier la date stockée
                console.log("Date de visite stockée:", date.toISOString());

                navigation.navigate('MainTabs', { screen: 'HomeScreen' });
                onClose();
            });
            return updatedResponses;
        });
    };

    return (
        <View style={styles.popupContainer}>
            <View style={styles.popup}>
                <FontAwesome name="times-circle" style={styles.closeIcon} onPress={onClose} />
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
                        <Button title="Choisir une date" onPress={() => setShowDatePicker(true)} />
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                style={{ width: '100%' }}
                            />
                        )}
                        <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>Confirmer</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    popupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    popup: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '80%',
        alignItems: 'center',
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 24,
        color: '#333',
    },
    question: {
        fontSize: 18,
        marginVertical: 20,
        textAlign: 'center',
    },
    answerButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default PopupSurvey;
