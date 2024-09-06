import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AlreadyVisitedSurvey = ({ setCurrentStep, responses, setResponses, styles }) => {
    const navigation = useNavigation();

    // Gestion de la réponse aux questions
    const handleAnswer = async (answer, type) => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  // Retour haptique
            const updatedResponses = { ...responses, [type]: answer };
            setResponses(updatedResponses);  // Mise à jour des réponses

            console.log('Réponse sélectionnée:', answer, 'Type:', type);
            console.log('Responses après mise à jour:', updatedResponses);

            // Redirection à la fin du questionnaire (si parkStyle est défini)
            if (type === 'parkStyle') {
                await AsyncStorage.setItem('userPreferences', JSON.stringify(updatedResponses));
                navigation.navigate('ReturnVisitorPage');
            }
        } catch (error) {
            console.error('Erreur lors de la gestion de la réponse :', error);
        }
    };

    useEffect(() => {
        console.log('Re-render triggered. Responses:', responses);
    }, [responses]);

    return (
        <View>
            {/* Étape 1: Combien de fois êtes-vous venu ? */}
            {!responses.visitCount && (
                <>
                    <Text style={styles.question}>Combien de fois es-tu venu ?</Text>
                    <TouchableOpacity onPress={() => handleAnswer('1 fois', 'visitCount')} style={styles.answerButton}>
                        <Text style={styles.buttonText}>1 fois</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAnswer('2-5 fois', 'visitCount')} style={styles.answerButton}>
                        <Text style={styles.buttonText}>2-5 fois</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAnswer('6-10 fois', 'visitCount')} style={styles.answerButton}>
                        <Text style={styles.buttonText}>6-10 fois</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Étape 2: Style de visite */}
            {responses.visitCount && !responses.parkStyle && (
                <>
                    <Text style={styles.question}>Plutôt rencontre personnage ou grosse journée ?</Text>
                    <TouchableOpacity onPress={() => handleAnswer('Rencontre personnage', 'parkStyle')} style={styles.answerButton}>
                        <Text style={styles.buttonText}>Rencontre personnage</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAnswer('Grosse journée', 'parkStyle')} style={styles.answerButton}>
                        <Text style={styles.buttonText}>Grosse journée</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default AlreadyVisitedSurvey;
