import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const NeverVisitedSurvey = ({ styles }) => {
    const [responses, setResponses] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [visitDate, setVisitDate] = useState(null);
    const navigation = useNavigation();

    // Gestion de la réponse aux questions
    const handleAnswer = async (answer, type) => {
        try {
            // Retour haptique
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Mise à jour des réponses
            const updatedResponses = { ...responses, [type]: answer };
            setResponses(updatedResponses);
            console.log('Réponse sélectionnée:', answer, 'Type:', type);
            console.log('Responses après mise à jour:', updatedResponses);

            // Si l'utilisateur choisit "Prévoyez de venir", afficher le DatePicker
            if (type === 'visitPlan' && answer === 'Prévoyez de venir') {
                setShowDatePicker(true); // Active l'affichage du DatePicker
            }
        } catch (error) {
            console.error('Erreur lors de la gestion de la réponse :', error);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false); // Masque le DatePicker après sélection
        if (selectedDate) {
            const fixedDate = new Date(selectedDate);
            setVisitDate(fixedDate);
            console.log('Date sélectionnée:', fixedDate.toLocaleDateString());
        }
    };

    const handleConfirmDate = async () => {
        if (visitDate) {
            try {
                // Sauvegarde de la date dans AsyncStorage et navigation vers HomeScreen
                await AsyncStorage.setItem('visitDate', visitDate.toISOString());
                navigation.navigate('HomeScreen');
            } catch (error) {
                console.error('Erreur lors de la sauvegarde de la date :', error);
            }
        }
    };

    useEffect(() => {
        console.log('Re-render triggered. Responses:', responses);
    }, [responses]);

    return (
        <View>
            {/* Étape 1: Prévoyez-vous de venir ou cherchez-vous des infos ? */}
            {!responses.visitPlan && (
                <>
                    <Text style={styles.question}>Prévois-tu de venir ou cherche-tu simplement des infos ?</Text>
                    <TouchableOpacity onPress={() => handleAnswer('Prévoyez de venir', 'visitPlan')} style={styles.answerButton}>
                        <Text style={styles.buttonText}>Prévoyez de venir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAnswer('Cherche des infos', 'visitPlan')} style={styles.answerButton}>
                        <Text style={styles.buttonText}>Cherche des infos</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Étape 2: Sélection de la date */}
            {responses.visitPlan === 'Prévoyez de venir' && (
                <>
                    <Text style={styles.question}>Quand prévoyez-vous de venir ?</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.answerButton}>
                        <Text style={styles.buttonText}>Choisir une date</Text>
                    </TouchableOpacity>
                    {visitDate && <Text style={styles.selectedDateText}>{visitDate.toLocaleDateString()}</Text>}
                    {visitDate && (
                        <TouchableOpacity onPress={handleConfirmDate} style={styles.answerButton}>
                            <Text style={styles.buttonText}>Confirmer</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}

            {/* Modal pour afficher le DatePicker */}
            {showDatePicker && (
                <Modal transparent={true} visible={showDatePicker} animationType="slide">
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                            <DateTimePicker
                                mode="date"
                                display="default"
                                value={visitDate || new Date()}
                                onChange={handleDateChange}
                            />
                            <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.answerButton}>
                                <Text style={styles.buttonText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default NeverVisitedSurvey;
