import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Button,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setAttractions, setShows, toggleFavoriteShow} from "../redux/actions/actions";
import BottomNav from "../components/mobileNavbar";

const HomeScreen = () => {
    // Récupérer les attractions et spectacles depuis Redux
    const attractions = useSelector(state => state.attractions.attractions);  // Attractions
    const shows = useSelector(state => state.shows.shows);  // Spectacles

    const [userName, setUserName] = useState('');
    const [visitDate, setVisitDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAttractions, setSelectedAttractions] = useState([]);
    const [selectedShows, setSelectedShows] = useState([]);
    const { width } = Dimensions.get('window');
    const dispatch = useDispatch();

    // Récupérer les données utilisateur depuis AsyncStorage
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedResponses = await AsyncStorage.getItem('userResponses');
                if (storedResponses) {
                    const parsedResponses = JSON.parse(storedResponses);
                    setUserName(parsedResponses.name || '');
                    if (parsedResponses.visitDate) {
                        setVisitDate(new Date(parsedResponses.visitDate));
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données utilisateur:", error);
            }
        };
        loadUserData();
    }, []);

    // Récupérer les spectacles via l'API lors du premier rendu
    useEffect(() => {
        dispatch(setShows());       // Pour récupérer les spectacles
        dispatch(setAttractions()); // Pour récupérer les attractions
    }, [dispatch]);


    const handleCreateDay = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const toggleAttractionSelection = (attractionId) => {
        setSelectedAttractions(prevState =>
            prevState.includes(attractionId)
                ? prevState.filter(id => id !== attractionId)
                : [...prevState, attractionId]
        );
    };

    const toggleShowSelection = (showId) => {
        setSelectedShows(prevState =>
            prevState.includes(showId)
                ? prevState.filter(id => id !== showId)
                : [...prevState, showId]
        );
    };

    const handleSubmitPlan = async () => {
        try {
            // Enregistrer les attractions et spectacles sélectionnés dans AsyncStorage ou traiter comme nécessaire
            const plannedDay = {
                selectedAttractions,
                selectedShows,
                date: new Date().toISOString(),
            };
            await AsyncStorage.setItem('plannedDay', JSON.stringify(plannedDay));
            // Fermer le modal
            setShowModal(false);
            console.log('Nouvelle journée créée avec les attractions et spectacles sélectionnés :', plannedDay);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la journée :', error);
        }
    };

    return (
        <SafeAreaView style={styles.homePage}>
            <View style={styles.content}>
                {/* Afficher le prénom de l'utilisateur */}
                {userName ? (
                    <Text style={styles.welcomeText}>Bienvenue {userName} !</Text>
                ) : (
                    <Text style={styles.welcomeText}>Bienvenue !</Text>
                )}

                {/* Afficher la date de visite */}
                {visitDate && (
                    <View style={styles.visitInfo}>
                        <Text style={styles.visitDateText}>
                            Votre prochaine visite est prévue le : {visitDate.toLocaleDateString()}
                        </Text>
                    </View>
                )}

                {/* Bouton pour créer une nouvelle journée */}
                <Button
                    title="Je crée ma prochaine journée sur le parc"
                    onPress={handleCreateDay}
                    style={styles.planDayButton}
                />

                {/* Modal pour la création d'une nouvelle journée */}
                <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={handleCloseModal}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Planifier une nouvelle journée</Text>

                            <ScrollView style={styles.selectionList}>
                                {/* Liste des attractions */}
                                <Text style={styles.sectionTitle}>Sélectionnez vos attractions :</Text>
                                {attractions.map(attraction => (
                                    <View key={attraction._id} style={styles.itemContainer}>
                                        <CheckBox
                                            value={selectedAttractions.includes(attraction._id)}
                                            onValueChange={() => toggleAttractionSelection(attraction._id)}
                                        />
                                        <Text style={styles.itemText}>{attraction.name}</Text>
                                    </View>
                                ))}

                                {/* Liste des spectacles */}
                                <Text style={styles.sectionTitle}>Sélectionnez vos spectacles :</Text>
                                {shows.map(show => (
                                    <View key={show._id} style={styles.itemContainer}>
                                        <CheckBox
                                            value={selectedShows.includes(show._id)}
                                            onValueChange={() => toggleShowSelection(show._id)}
                                        />
                                        <Text style={styles.itemText}>{show.name}</Text>
                                    </View>
                                ))}
                            </ScrollView>

                            {/* Bouton pour valider la journée */}
                            <Button title="Valider ma journée" onPress={handleSubmitPlan} />

                            {/* Bouton pour fermer le modal */}
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                                <Text style={styles.closeButtonText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
            {width <= 768 && <BottomNav />}
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
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
        textAlign: 'center',
        color: '#333',
    },
    visitInfo: {
        marginBottom: 20,
        alignItems: 'center',
    },
    visitDateText: {
        fontSize: 16,
        color: '#555',
    },
    planDayButton: {
        marginVertical: 20,
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
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    selectionList: {
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemText: {
        fontSize: 16,
        marginLeft: 10,
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
