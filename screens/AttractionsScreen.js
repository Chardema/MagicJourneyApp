// AttractionsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    Modal,
    Switch,
} from 'react-native';
import { useWindowWidth } from '../components/utils';
import {
    setSearchTerm,
    toggleFavorite,
} from '../redux/actions/actions';
import BottomNav from '../components/mobileNavbar';
import AttractionsMap from '../components/AttractionsMap';
import AttractionModal from '../components/ModalAttractions';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import {
    getFilteredRideData,
    getRawRideData,
    getFilters,
    getSearchTerm,
} from '../redux/selector';
import LoadingScreen from '../components/LoadingScreenData';
import AttractionCard from '../components/AttractionCard';
import ActivityModal from "../components/Homescreen/ActivityModal";

const AttractionsScreen = () => {
    const dispatch = useDispatch();
    const rawRideData = useSelector(getRawRideData);
    const searchTerm = useSelector(getSearchTerm);
    const favorites = useSelector((state) => state.favorites.favorites);
    const filters = useSelector(getFilters);
    const filteredRideData = useSelector(getFilteredRideData);
    const dataLoaded = useSelector((state) => state.attractions.isLoaded);

    const [viewMode, setViewMode] = useState('list');
    const [previousWaitTimes, setPreviousWaitTimes] = useState({});
    const [changeTimestamps, setChangeTimestamps] = useState({});
    const [activityModalVisible, setActivityModalVisible] = useState(false); // Pour ActivityModal
    const [attractionModalVisible, setAttractionModalVisible] = useState(false); // Pour AttractionModal
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [filtersModalVisible, setFiltersModalVisible] = useState(false);

    const width = useWindowWidth();
    const navigation = useNavigation();

    // Enlève le header par défaut
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Fonction pour appliquer les filtres
    const applyFilters = useCallback(
        (data) => {
            let filteredData = [...data];

            // Appliquer les filtres
            if (filters.selectedLand !== 'all') {
                filteredData = filteredData.filter((ride) => ride.land === filters.selectedLand);
            }

            if (filters.selectedType !== 'all') {
                filteredData = filteredData.filter((ride) => ride.type === filters.selectedType);
            }

            if (filters.showShortWaitTimesOnly) {
                filteredData = filteredData.filter((ride) => ride.waitTime && ride.waitTime < 40);
            }

            if (filters.hideClosedRides) {
                filteredData = filteredData.filter((ride) => ride.status !== 'CLOSED');
            }

            if (searchTerm) {
                filteredData = filteredData.filter((ride) =>
                    ride.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            return filteredData;
        },
        [filters, searchTerm]
    );

    // Gestion du changement de filtre
    const handleFilterChange = (filter, value) => {
        dispatch({ type: 'SET_FILTER', payload: { filter, value } });
    };

    // Gestion de la recherche
    const handleSearchChange = (text) => {
        dispatch(setSearchTerm(text));
    };

    // Gestion des favoris
    const handleToggleFavorite = async (attractionId) => {
        try {
            if (!attractionId) return;
            dispatch(toggleFavorite(attractionId));
        } catch (error) {
            console.error("Erreur lors de l'ajout aux favoris:", error);
        }
    };

    // Ouverture du modal avec les détails de l'attraction
    const openModalWithAttraction = (attraction) => {
        setSelectedAttraction(attraction);
        setAttractionModalVisible(true); // Utiliser l'état spécifique
    };

    // Affichage de l'écran de chargement si les données sont en cours de chargement
    if (!dataLoaded || !rawRideData || !filteredRideData) {
        return <LoadingScreen />;
    }

    // Fonction pour obtenir l'image d'une activité (à implémenter selon vos besoins)
    const getImageForActivity = (activity, category) => {
        // Exemple : retourner une image basée sur la catégorie ou l'activité
        // Remplacez ceci par votre logique d'obtention d'images
        return { uri: activity.imageUrl };
    };

    // État pour gérer la sélection de catégorie (à ajouter si nécessaire)
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

    // État pour gérer les activités sélectionnées (à ajouter si nécessaire)
    const [selectedActivities, setSelectedActivities] = useState([]);

    // Fonction pour gérer la sélection d'une activité (à ajouter si nécessaire)
    const handleSelectActivity = (activity) => {
        setSelectedActivities((prevSelected) => {
            if (prevSelected.some((a) => a._id === activity._id)) {
                return prevSelected.filter((a) => a._id !== activity._id);
            } else {
                return [...prevSelected, activity];
            }
        });
    };

    // Fonction pour gérer la confirmation des activités sélectionnées (à ajouter si nécessaire)
    const handleConfirmActivities = () => {
        // Implémentez la logique pour confirmer les activités sélectionnées
        // Par exemple, naviguer vers une autre écran ou mettre à jour le store
        console.log('Activités sélectionnées:', selectedActivities);
    };

    // Fonction pour ouvrir ActivityModal
    const openActivityModal = () => {
        setActivityModalVisible(true);
    };

    // Fonction pour fermer ActivityModal
    const closeActivityModal = () => {
        setActivityModalVisible(false);
    };

    return (
        <View style={styles.bodyAttraction}>
            <View style={styles.header}>
                <Button
                    title="Liste"
                    onPress={() => setViewMode('list')}
                    color={viewMode === 'list' ? '#007BFF' : '#ddd'}
                />
                <Button
                    title="Itinéraire"
                    onPress={() => setViewMode('map')}
                    color={viewMode === 'map' ? '#007BFF' : '#ddd'}
                />
                {/* Ajoutez un bouton pour ouvrir ActivityModal */}
                <Button
                    title="Voir les activités"
                    onPress={openActivityModal}
                    color="#007BFF"
                />
            </View>
            {viewMode === 'list' ? (
                <ScrollView style={styles.container}>
                    <TextInput
                        placeholder="Quelle attraction aujourd'hui ?"
                        style={styles.searchAttraction}
                        value={searchTerm}
                        onChangeText={handleSearchChange}
                    />
                    <Button
                        title="Filtrer"
                        onPress={() => setFiltersModalVisible(true)}
                    />
                    <View style={styles.attractionsList}>
                        {filteredRideData && filteredRideData.length > 0 ? (
                            filteredRideData.map((ride) => {
                                const isFavorite = favorites.some((fav) => fav._id === ride._id);
                                const previousWaitTime = previousWaitTimes[ride._id]?.previousWaitTime;
                                const currentWaitTime = ride.waitTime;
                                const changeTimestamp = changeTimestamps[ride._id];

                                return (
                                    <AttractionCard
                                        key={ride._id}
                                        item={ride}
                                        onToggleFavorite={handleToggleFavorite}
                                        onDetailsPress={() => openModalWithAttraction(ride)}
                                        isFavorite={isFavorite}
                                    />
                                );
                            })
                        ) : (
                            <Text>Aucune attraction correspondant à la recherche.</Text>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>
                    <AttractionsMap attractions={filteredRideData || []} />
                </View>
            )}
            <Modal
                visible={filtersModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFiltersModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filtres</Text>
                        <View style={styles.filterOption}>
                            <Text>Land :</Text>
                            <Picker
                                selectedValue={filters.selectedLand}
                                onValueChange={(itemValue) => handleFilterChange('selectedLand', itemValue)}
                                style={styles.selectOption}
                            >
                                <Picker.Item label="Tous les lands" value="all" />
                                <Picker.Item label="Adventureland" value="Adventureland" />
                                <Picker.Item label="Fantasyland" value="Fantasyland" />
                                <Picker.Item label="Frontierland" value="Frontierland" />
                                <Picker.Item label="Discoveryland" value="Discoveryland" />
                            </Picker>
                        </View>
                        <View style={styles.filterOption}>
                            <Text>Type :</Text>
                            <Picker
                                selectedValue={filters.selectedType}
                                onValueChange={(itemValue) => handleFilterChange('selectedType', itemValue)}
                                style={styles.selectOption}
                            >
                                <Picker.Item label="Types d'attractions" value="all" />
                                <Picker.Item label="Famille" value="Famille" />
                                <Picker.Item label="Sensation" value="Sensation" />
                            </Picker>
                        </View>
                        <View style={styles.checkbox}>
                            <Text>Moins de 40 min d'attente</Text>
                            <Switch
                                value={filters.showShortWaitTimesOnly}
                                onValueChange={(value) => handleFilterChange('showShortWaitTimesOnly', value)}
                            />
                        </View>
                        <View style={styles.checkbox}>
                            <Text>Masquer les attractions fermées</Text>
                            <Switch
                                value={filters.hideClosedRides}
                                onValueChange={(value) => handleFilterChange('hideClosedRides', value)}
                            />
                        </View>
                        <Button title="Appliquer" onPress={() => setFiltersModalVisible(false)} />
                    </View>
                </View>
            </Modal>
            <View style={styles.footerSpace} />
            <BottomNav />
            {selectedAttraction && (
                <AttractionModal
                    isOpen={attractionModalVisible}
                    onClose={() => setAttractionModalVisible(false)}
                    attractionDetails={selectedAttraction || {}}
                />
            )}
            {/* Ajout du ActivityModal connecté à Redux */}
            <ActivityModal
                isVisible={activityModalVisible}
                selectedCategoryIndex={selectedCategoryIndex}
                setSelectedCategoryIndex={setSelectedCategoryIndex}
                selectedActivities={selectedActivities}
                onSelectActivity={handleSelectActivity}
                onConfirm={handleConfirmActivities}
                dataLoaded={dataLoaded}
                onClose={closeActivityModal}
                getImageForActivity={getImageForActivity}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    bodyAttraction: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        paddingTop: 40,
        borderBottomColor: '#E0E0E0',
    },
    container: {
        padding: 15,
    },
    footerSpace: {
        height: 80,
    },
    searchAttraction: {
        padding: 12,
        fontSize: 16,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
    },
    filters: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    filterOption: {
        marginBottom: 15,
    },
    selectOption: {
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#FFF',
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    noRidesMessage: {
        textAlign: 'center',
        color: '#999999',
    },
    attractionsList: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default AttractionsScreen;
