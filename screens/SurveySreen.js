import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    Animated,
    Modal,
    ScrollView,
    Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
const windowHeight = Dimensions.get('window').height;

const SurveyScreen = () => {
    const [currentQuestionId, setCurrentQuestionId] = useState('welcome');
    const [responses, setResponses] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [visitDate, setVisitDate] = useState(null);
    const navigation = useNavigation();

    // Animations pour les encadrés
    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const fadeAnim4 = useRef(new Animated.Value(0)).current;

    // Structure des questions du questionnaire
    const questions = [
        {
            id: 'welcome',
            type: 'info',
            title: 'Bienvenue sur Magic Journey',
            description: 'Magic Journey vous accompagne pour une visite optimale à Disneyland Paris. Découvrez ci-dessous ce que notre application peut faire pour vous :',
            features: [
                {
                    icon: 'clock-o',
                    title: 'Temps d\'attente en direct',
                    description: 'Consultez les temps d\'attente en temps réel pour toutes les attractions.',
                    animation: fadeAnim1,
                },
                {
                    icon: 'map-o',
                    title: 'Navigation interactive',
                    description: 'Naviguez facilement à travers le parc avec notre carte interactive.',
                    animation: fadeAnim2,
                },
                {
                    icon: 'lightbulb-o',
                    title: 'Astuces et secrets',
                    description: 'Découvrez des secrets cachés et des astuces pour maximiser votre visite.',
                    animation: fadeAnim3,
                },
                {
                    icon: 'star',
                    title: 'Intelligence Artificielle (Bientôt)',
                    description: 'Laissez notre IA planifier et optimiser votre journée en temps réel.',
                    animation: fadeAnim4,
                },
            ],
            buttonText: 'Commencer',
            next: 'askName',
        },
        {
            id: 'askName',
            type: 'input',
            question: 'Commençons par personnaliser ton application. Quel est ton prénom ?',
            placeholder: 'Entrez votre prénom',
            key: 'name',
            next: 'favoriteAttraction',
        },
        {
            id: 'favoriteAttraction',
            type: 'choice',
            question: (responses) => `Bonjour ${responses.name || ''}, quelle est ton attraction préférée ?`,
            options: [
                { text: 'Buzz Lightyear Laser Blast', value: 'Buzz Lightyear Laser Blast' },
                { text: 'It’s a Small World', value: 'It’s a Small World' },
                { text: 'La Tour de la Terreur', value: 'La Tour de la Terreur' },
                { text: 'Pirates des Caraïbes', value: 'Pirates des Caraïbes' },
            ],
            key: 'favoriteAttraction',
            next: 'end',
        },
        {
            id: 'end',
            type: 'end',
        },
    ];

    // Démarrer les animations au montage du composant
    React.useEffect(() => {
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
    }, []);

    const handleAnswer = async (key, value, nextQuestionId) => {
        setResponses((prev) => ({ ...prev, [key]: value }));

        if (nextQuestionId) {
            setCurrentQuestionId(nextQuestionId);
        } else {
            await AsyncStorage.setItem('userResponses', JSON.stringify({ ...responses, [key]: value }));
            navigation.navigate('MainTabs', { screen: 'Home' });
        }
    };

    const currentQuestion = questions.find((q) => q.id === currentQuestionId);

    if (!currentQuestion) return null;

    return (
        <ScrollView style={styles.pageContainer}>
            <Image source={require('../assets/viewingarea.jpg')} style={styles.headerImage} />
            <View style={styles.contentContainer}>
                {currentQuestion.type === 'info' && (
                    <>
                        <Text style={styles.title}>{currentQuestion.title}</Text>
                        <Text style={styles.description}>{currentQuestion.description}</Text>
                        {currentQuestion.features.map((feature, index) => (
                            <Animated.View key={index} style={[styles.featureContainer, { opacity: feature.animation }]}>
                                <Icon name={feature.icon} size={30} color="#FF6F61" style={styles.icon} />
                                <View style={styles.featureTextContainer}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDescription}>{feature.description}</Text>
                                </View>
                            </Animated.View>
                        ))}
                        <TouchableOpacity
                            onPress={() => setCurrentQuestionId(currentQuestion.next)}
                            style={styles.answerButton}
                        >
                            <Text style={styles.buttonText}>{currentQuestion.buttonText}</Text>
                        </TouchableOpacity>
                    </>
                )}

                {currentQuestion.type === 'input' && (
                    <>
                        <Text style={styles.question}>{currentQuestion.question}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={currentQuestion.placeholder}
                            value={responses[currentQuestion.key] || ''}
                            onChangeText={(text) => setResponses({ ...responses, [currentQuestion.key]: text })} // Update value in responses
                        />
                        <TouchableOpacity
                            onPress={() => {
                                if (responses[currentQuestion.key]) {
                                    setCurrentQuestionId(currentQuestion.next);
                                }
                            }}
                            style={styles.answerButton}
                        >
                            <Text style={styles.buttonText}>Confirmer</Text>
                        </TouchableOpacity>
                    </>
                )}

                {currentQuestion.type === 'choice' && (
                    <>
                        <Text style={styles.question}>
                            {typeof currentQuestion.question === 'function'
                                ? currentQuestion.question(responses)
                                : currentQuestion.question}
                        </Text>
                        {currentQuestion.options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => handleAnswer(currentQuestion.key, option.value, option.next)}
                                style={styles.answerButton}
                            >
                                <Text style={styles.buttonText}>{option.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {currentQuestion.type === 'end' && (
                    <>
                        <Text style={styles.title}>Merci d'avoir répondu au questionnaire !</Text>
                        <TouchableOpacity
                            onPress={async () => {
                                await AsyncStorage.setItem('userResponses', JSON.stringify(responses));
                                navigation.navigate('MainTabs', { screen: 'Home' });
                            }}
                            style={styles.answerButton}
                        >
                            <Text style={styles.buttonText}>Continuer</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerImage: {
        width: '100%',
        height: windowHeight * 0.25,
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

export default SurveyScreen;
