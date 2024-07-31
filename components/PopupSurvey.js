// PopupSurvey.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { toggleFavorite } from "../redux/actions/actions";
import CardSwipe from '../components/CardSwipe';
import { attractionImages } from "../screens/AttractionsScreen";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';


const questionIcons = {
    0: <FontAwesome name="home" size={30} />,
    1: <FontAwesome name="smile-o" size={30} />,
    2: <FontAwesome name="rocket" size={30} />,
    3: <FontAwesome name="hourglass" size={30} />, // Utilisation de "hourglass"
};


// Définition des questions
const questions = [
    {
        question: "Bonjour et Bienvenue dans Magic Journey, l'application qui vous fera profiter au maximum de Disneyland Paris",
        answers: ['Suivant'],
        type: 'intro',
    },
    {
        question: "Commençons par quelques questions pour découvrir votre première attraction",
        answers: ['Suivant'],
        type: 'intro',
    },
    {
        question: "Quel type d'attractions préférez-vous ?",
        answers: ['Famille', 'Sensation', "Sans file d'attente", 'Rencontre avec les personnages'],
        type: 'typePreference',
    },
    {
        question: "Quelle durée d'attente est acceptable pour vous ?",
        answers: ['Moins de 15 minutes', '15-30 minutes', '30-60 minutes', 'Plus de 60 minutes'],
        type: 'waitTimePreference',
    },
    {
        question: "Pouvez-vous faire des attractions à sensation forte ?",
        answers: ['Oui', 'Non'],
        type: 'SensationQuestion',
    },
];

const PopupSurvey = ({ onClose, attractions }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState({
        typePreference: [],
        waitTimePreference: '',
    });
    const [showConfirmButton, setShowConfirmButton] = useState(false);
    const [currentAttractionIndex, setCurrentAttractionIndex] = useState(0);
    const dispatch = useDispatch();
    const [hasSwipedAllAttractions, setHasSwipedAllAttractions] = useState(false);

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const storedPreferences = await AsyncStorage.getItem('userPreferences');
                if (storedPreferences) {
                    const parsedPreferences = JSON.parse(storedPreferences);
                    setResponses({
                        typePreference: parsedPreferences.typePreference || [],
                        waitTimePreference: parsedPreferences.waitTimePreference || '',
                    });
                }
            } catch (error) {
                console.error("Failed to load preferences", error);
            }
        };

        loadPreferences();
    }, []);

    // Fonction handleAnswer pour gérer les réponses
    const handleAnswer = useCallback((answer, type) => {
        setResponses(current => {
            const updatedResponses = {
                ...current,
                [type]: type === 'typePreference'
                    ? current.typePreference.includes(answer)
                        ? current.typePreference.filter(item => item !== answer)
                        : [...current.typePreference, answer]
                    : answer,
            };

            if (type !== 'typePreference' || answer === 'Suivant') {
                setCurrentStep(prev => Math.min(prev + 1, questions.length));
                setShowConfirmButton(false);
            } else if (type === 'typePreference') {
                setShowConfirmButton(updatedResponses.typePreference.length > 0);
            }

            return updatedResponses;
        });
    }, []);

    useEffect(() => {
        if (questions[currentStep]?.type === 'typePreference') {
            setShowConfirmButton(responses.typePreference.length > 0);
        } else {
            setShowConfirmButton(false);
        }
    }, [currentStep, responses.typePreference]);

    useEffect(() => {
        if (currentStep === questions.length) {
            const savePreferences = async () => {
                try {
                    await AsyncStorage.setItem('userPreferences', JSON.stringify(responses));
                } catch (error) {
                    console.error("Failed to save preferences", error);
                }
            };

            savePreferences();
        }
    }, [currentStep, responses]);

    // Calcul des attractions recommandées en fonction des réponses
    const recommendedAttractions = useMemo(() => {
        if (!attractions || !responses.typePreference.length) return [];

        let maxWaitTime;
        switch (responses.waitTimePreference) {
            case 'Moins de 15 minutes': maxWaitTime = 15; break;
            case '15-30 minutes': maxWaitTime = 30; break;
            case '30-60 minutes': maxWaitTime = 60; break;
            case 'Plus de 60 minutes': maxWaitTime = Infinity; break;
            default: maxWaitTime = Infinity;
        }

        return attractions.filter(attraction =>
            (responses.typePreference.length === 0 || responses.typePreference.some(type => attraction.type.includes(type))) &&
            attraction.waitTime <= maxWaitTime
        );
    }, [attractions, responses]);

    const onSwipeLeft = useCallback(() => {
        if (currentAttractionIndex < recommendedAttractions.length - 1) {
            setCurrentAttractionIndex(prev => prev + 1);
        } else {
            setHasSwipedAllAttractions(true);
        }
    }, [currentAttractionIndex, recommendedAttractions.length]);

    const onSwipeRight = useCallback((attraction) => {
        dispatch(toggleFavorite(attraction));
        if (currentAttractionIndex < recommendedAttractions.length - 1) {
            setCurrentAttractionIndex(prev => prev + 1);
        } else {
            setHasSwipedAllAttractions(true);
        }
    }, [dispatch, currentAttractionIndex, recommendedAttractions.length]);

    return (
        <View style={styles.popupContainer}>
            <View style={styles.popup}>
                <FontAwesome name="times-circle" style={styles.closeIcon} onPress={onClose} />
                {currentStep < questions.length ? (
                    <>
                        {questionIcons[currentStep] || null}
                        <Text style={styles.question}>{questions[currentStep].question}</Text>
                        {questions[currentStep].answers.map((answer, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleAnswer(answer, questions[currentStep].type)}
                                style={[
                                    styles.answerButton,
                                    responses[questions[currentStep].type]?.includes(answer) && styles.selected
                                ]}
                            >
                                <Text>{answer}</Text>
                            </TouchableOpacity>
                        ))}
                        {showConfirmButton && (
                            <TouchableOpacity
                                onPress={() => {
                                    setCurrentStep(prev => prev + 1);
                                    setShowConfirmButton(false);
                                }}
                                style={styles.confirmButton}
                            >
                                <Text style={styles.confirmButtonText}>Confirmer</Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <>
                        <Text style={styles.recommendationTitle}>Attractions recommandées pour vous</Text>
                        {recommendedAttractions.length > 0 && !hasSwipedAllAttractions ? (
                            <>
                                <CardSwipe
                                    key={recommendedAttractions[currentAttractionIndex].id}
                                    attraction={{
                                        ...recommendedAttractions[currentAttractionIndex],
                                        image: attractionImages[recommendedAttractions[currentAttractionIndex].name]
                                    }}
                                    onSwipeLeft={onSwipeLeft}
                                    onSwipeRight={() => onSwipeRight(recommendedAttractions[currentAttractionIndex])}
                                />
                                <View style={styles.actionButtons}>
                                    <FontAwesome name="times-circle" style={styles.passIcon} onPress={onSwipeLeft} />
                                    <FontAwesome name="heart" style={styles.favoriteIcon} onPress={() => onSwipeRight(recommendedAttractions[currentAttractionIndex])} />
                                </View>
                            </>
                        ) : (
                            <Text style={styles.noMoreAttractionsText}>Toutes les attractions recommandées ont été parcourues. Appuyez sur "Fermer" pour continuer.</Text>
                        )}
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

// Styles pour PopupSurvey
const styles = StyleSheet.create({
    popupContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000, // Pour s'assurer qu'il soit au-dessus
    },
    popup: {
        backgroundColor: '#f0f0f0',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
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
        backgroundColor: 'white',
        borderColor: '#007BFF',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
    },
    selected: {
        backgroundColor: '#007BFF',
        color: 'white',
    },
    confirmButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#007BFF',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
    },
    recommendationTitle: {
        fontSize: 20,
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    passIcon: {
        fontSize: 50,
        color: '#c82333',
    },
    favoriteIcon: {
        fontSize: 50,
        color: 'red',
    },
    noMoreAttractionsText: {
        textAlign: 'center',
        marginVertical: 20,
    },
    closeButton: {
        backgroundColor: '#c82333',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    icon: {
        fontSize: 48,
        color: '#007BFF',
        marginVertical: 20,
    },
});

export default PopupSurvey;
