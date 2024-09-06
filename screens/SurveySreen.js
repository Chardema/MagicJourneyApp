import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Animated } from 'react-native';
import NeverVisitedSurvey from '../components/NeverVisitedSurvey';
import AlreadyVisitedSurvey from '../components/AlreadyVisitedSurvey';
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/FontAwesome";

const VisitSurveyPage = () => {
    const [currentStep, setCurrentStep] = useState(0); // Gérer les étapes
    const [responses, setResponses] = useState({}); // Stocker les réponses
    const [name, setName] = useState(''); // Stocker le prénom de l'utilisateur
    const navigation = useNavigation();

    // Animations pour les encadrés
    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const fadeAnim4 = useRef(new Animated.Value(0)).current; // Pour l'encadré de l'IA

    useEffect(() => {
        // Démarrer les animations de façon séquentielle
        Animated.sequence([
            Animated.timing(fadeAnim1, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim2, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim3, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim4, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim1, fadeAnim2, fadeAnim3, fadeAnim4]);

    // Gestion de la réponse à la question principale
    const handleFirstAnswer = (answer) => {
        setResponses((prev) => ({ ...prev, visitedDisney: answer }));
        setCurrentStep(3); // Passe à l'étape suivante (le questionnaire spécifique)
    };

    const handleNameSubmit = () => {
        if (name.trim()) {
            setResponses((prev) => ({ ...prev, name })); // Sauvegarde du prénom
            setCurrentStep(2); // Passer à la question "Avez-vous déjà visité Disneyland Paris ?"
        }
    };

    return (
        <View style={styles.pageContainer}>
            <Image source={require('../assets/viewingarea.jpg')} style={styles.headerImage} />
            <View style={styles.contentContainer}>
                {/* Étape 0: Bienvenue avec des explications */}
                {currentStep === 0 && (
                    <>
                        <Text style={styles.title}>Bienvenue sur Magic Journey</Text>
                        <Text style={styles.description}>
                            Magic Journey vous accompagne pour une visite optimale à Disneyland Paris.
                            Découvrez ci-dessous ce que notre application peut faire pour vous :
                        </Text>

                        {/* Encadré 1 avec animation */}
                        <Animated.View style={[styles.featureContainer, { opacity: fadeAnim1 }]}>
                            <Icon name="clock-o" size={30} color="#FF6F61" style={styles.icon} />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>Temps d'attente en direct</Text>
                                <Text style={styles.featureDescription}>
                                    Consultez les temps d'attente en temps réel pour toutes les attractions.
                                </Text>
                            </View>
                        </Animated.View>

                        {/* Encadré 2 avec animation */}
                        <Animated.View style={[styles.featureContainer, { opacity: fadeAnim2 }]}>
                            <Icon name="map-o" size={30} color="#FF6F61" style={styles.icon} />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>Navigation interactive</Text>
                                <Text style={styles.featureDescription}>
                                    Naviguez facilement à travers le parc avec notre carte interactive.
                                </Text>
                            </View>
                        </Animated.View>

                        {/* Encadré 3 avec animation */}
                        <Animated.View style={[styles.featureContainer, { opacity: fadeAnim3 }]}>
                            <Icon name="lightbulb-o" size={30} color="#FF6F61" style={styles.icon} />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>Astuces et secrets</Text>
                                <Text style={styles.featureDescription}>
                                    Découvrez des secrets cachés et des astuces pour maximiser votre visite.
                                </Text>
                            </View>
                        </Animated.View>

                        {/* Encadré pour l'intelligence artificielle */}
                        <Animated.View style={[styles.featureContainer, { opacity: fadeAnim4 }]}>
                            <Icon name="star" size={30} color="#FF6F61" style={styles.icon} />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>Intelligence Artificielle (Bientôt)</Text>
                                <Text style={styles.featureDescription}>
                                    Laissez notre IA planifier et optimiser votre journée en temps réel.
                                </Text>
                            </View>
                        </Animated.View>

                        <TouchableOpacity onPress={() => setCurrentStep(1)} style={styles.answerButton}>
                            <Text style={styles.buttonText}>Commencer</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Étape 1: Demande du prénom */}
                {currentStep === 1 && (
                    <>
                        <Text style={styles.title}>Commençons par personnaliser ton application</Text>
                        <Text style={styles.question}>Quel est ton prénom ?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Entrez votre prénom"
                            value={name}
                            onChangeText={(text) => setName(text)}
                        />
                        <TouchableOpacity onPress={handleNameSubmit} style={styles.answerButton}>
                            <Text style={styles.buttonText}>Confirmer</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Étape 2: Avez-vous déjà visité Disneyland Paris ? */}
                {currentStep === 2 && (
                    <>
                        <Text style={styles.question}>
                            Bienvenue sur MagicJourney {name ? `${name}, as-tu déjà visité Disneyland Paris ?` : "As-tu déjà visité Disneyland Paris ?"}
                        </Text>

                        <TouchableOpacity onPress={() => handleFirstAnswer('Oui')} style={styles.answerButton}>
                            <Text style={styles.buttonText}>Oui</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleFirstAnswer('Non')} style={styles.answerButton}>
                            <Text style={styles.buttonText}>Non</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Étape 3: Redirection vers le bon questionnaire */}
                {currentStep === 3 && responses.visitedDisney === 'Oui' && (
                    <AlreadyVisitedSurvey
                        setCurrentStep={setCurrentStep}
                        responses={responses}
                        setResponses={setResponses}
                        styles={styles}
                    />
                )}

                {currentStep === 3 && responses.visitedDisney === 'Non' && (
                    <NeverVisitedSurvey
                        setCurrentStep={setCurrentStep}
                        responses={responses} // Passer les réponses incluant le prénom
                        setResponses={setResponses}
                        styles={styles}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    featureContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        alignItems: 'center',
    },
    icon: {
        marginRight: 15,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
});

export default VisitSurveyPage;
