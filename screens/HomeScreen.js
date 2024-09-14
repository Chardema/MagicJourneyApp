// HomeScreen.js
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
import { setAttractions, setShows } from '../redux/actions/actions';
import BottomNav from '../components/mobileNavbar';
import AttractionCard from '../components/AttractionCard';

const HomeScreen = ({navigation}) => {
    // Récupérer les attractions et spectacles depuis Redux
    const attractions = useSelector((state) => state.attractions.attractions);
    const shows = useSelector((state) => state.shows.shows);

    const [userName, setUserName] = useState('');
    const [visitDate, setVisitDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAttractions, setSelectedAttractions] = useState([]);
    const [selectedShows, setSelectedShows] = useState([]);
    const [plannedDay, setPlannedDay] = useState(null); // Nouvel état pour stocker la journée planifiée
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
                console.error('Erreur lors du chargement des données utilisateur:', error);
            }
        };
        loadUserData();
    }, []);

    // Récupérer les spectacles et attractions via l'API lors du premier rendu
    useEffect(() => {
        dispatch(setShows());
        dispatch(setAttractions());
    }, [dispatch]);

    // Récupérer la journée planifiée depuis AsyncStorage
    useEffect(() => {
        const loadPlannedDay = async () => {
            try {
                const storedPlannedDay = await AsyncStorage.getItem('plannedDay');
                if (storedPlannedDay) {
                    setPlannedDay(JSON.parse(storedPlannedDay));
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la journée planifiée :', error);
            }
        };
        loadPlannedDay();
    }, []);

    const handleCreateDay = () => {
        setShowModal(true);
    };

    useEffect(() => {
        navigation.setOptions({
            title: `Bienvenue, ${userName}`,
        });
    }, [userName, navigation]);

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const toggleAttractionSelection = (attractionId) => {
        setSelectedAttractions((prevState) =>
            prevState.includes(attractionId)
                ? prevState.filter((id) => id !== attractionId)
                : [...prevState, attractionId]
        );
    };

    const toggleShowSelection = (showId) => {
        setSelectedShows((prevState) =>
            prevState.includes(showId)
                ? prevState.filter((id) => id !== showId)
                : [...prevState, showId]
        );
    };

    const handleSubmitPlan = async () => {
        try {
            const plannedDayData = {
                selectedAttractions,
                selectedShows,
                date: new Date().toISOString(),
            };
            await AsyncStorage.setItem('plannedDay', JSON.stringify(plannedDayData));
            // Mettre à jour l'état
            setPlannedDay(plannedDayData);
            // Réinitialiser les sélections
            setSelectedAttractions([]);
            setSelectedShows([]);
            // Fermer le modal
            setShowModal(false);
            console.log(
                'Nouvelle journée créée avec les attractions et spectacles sélectionnés :',
                plannedDayData
            );
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la journée :', error);
        }
    };

    // Récupérer les données complètes des attractions et spectacles sélectionnés
    const selectedAttractionsData =
        plannedDay && plannedDay.selectedAttractions
            ? plannedDay.selectedAttractions
                .map((id) => attractions.find((attraction) => attraction._id === id))
                .filter((item) => item)
            : [];

    const selectedShowsData =
        plannedDay && plannedDay.selectedShows
            ? plannedDay.selectedShows
                .map((id) => shows.find((show) => show._id === id))
                .filter((item) => item)
            : []
    const renderScheduleInfo = (schedules, parkName) => {
        const selectedDaySchedules = schedules?.filter(schedule => schedule.date === visitDate.toISOString().split('T')[0]);
        const operatingSchedule = selectedDaySchedules?.find(s => s.type === "OPERATING");

        if (!operatingSchedule) {
            return <Text>{parkName} : Bientôt disponible !</Text>;
        }

        return (
            <Text>
                {parkName} : {formatTime(new Date(operatingSchedule.openingTime))} - {formatTime(new Date(operatingSchedule.closingTime))}
            </Text>
        );
    };

    return (
        <SafeAreaView style={styles.homePage}>
            <View style={styles.content}>
                {/* Affichage des horaires des parcs */}
                <View style={styles.parkHoursContainer}>
                    <View style={styles.park}>
                        {renderScheduleInfo(parkHours?.disneyland?.schedule, 'Le Parc Disneyland')}
                    </View>
                    <View style={styles.park}>
                        {renderScheduleInfo(parkHours?.studio?.schedule, 'Les Walt Disney Studios')}
                    </View>
                </View>
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

                {/* Afficher la journée planifiée */}
                {plannedDay && (
                    <View style={styles.plannedDayContainer}>
                        <Text style={styles.sectionTitle}>Votre journée planifiée :</Text>
                        {/* Afficher les attractions sélectionnées */}
                        <Text style={styles.subSectionTitle}>Attractions sélectionnées :</Text>
                        {selectedAttractionsData.length > 0 ? (
                            <View style={styles.attractionsList}>
                                {selectedAttractionsData.map((item) => {
                                    console.log('Selected Attraction:', item); // Ajoutez ce log ici pour vérifier les données
                                    return (
                                        <AttractionCard
                                            key={item._id}
                                            item={item}
                                        />
                                    );
                                })}

                            </View>
                        ) : (
                            <Text style={styles.itemText}>Aucune attraction sélectionnée.</Text>
                        )}

                        {/* Afficher les spectacles sélectionnés */}
                        <Text style={styles.subSectionTitle}>Spectacles sélectionnés :</Text>
                        {selectedShowsData.length > 0 ? (
                            <View style={styles.attractionsList}>
                                {selectedShowsData.map((item) => (
                                    <AttractionCard
                                        key={item._id}
                                        item={item}
                                        type="show"
                                        onToggleFavorite={null}
                                        onDetailsPress={null}
                                        isFavorite={false}
                                    />
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.itemText}>Aucun spectacle sélectionné.</Text>
                        )}
                    </View>
                )}

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
                                {attractions.map((attraction) => (
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
                                {shows.map((show) => (
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
    plannedDayContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    attractionsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    itemText: {
        fontSize: 16,
        marginLeft: 10,
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
    selectionList: {
        width: '100%',
        marginBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
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
