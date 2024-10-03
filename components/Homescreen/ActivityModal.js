// ActivityModal.js

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SectionList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    Animated,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Button, ButtonGroup } from 'react-native-elements';
import ReactNativeModal from 'react-native-modal';
import { isAttractionAvailable } from '../utils/attractionAvailability';

const parkIcons = {
    'Disneyland Park': require('../../assets/Disneylandlogo.png'),
    'Walt Disney Studios Park': require('../../assets/Studioslogo.png'),
};

// Mapping des noms des parcs aux parkId correspondants
const parkIdMapping = {
    'Disneyland Park': 'dae968d5-630d-4719-8b06-3d107e944401',
    'Walt Disney Studios Park': 'ca888437-ebb4-4d50-aed2-d227f7096968',
};

const ActivityModal = ({
                           isVisible,
                           categories,
                           activities,
                           selectedCategoryIndex,
                           setSelectedCategoryIndex,
                           selectedActivities = [],
                           onSelectActivity,
                           onConfirm,
                           dataLoaded,
                           onClose,
                           getImageForActivity,
                           scheduledActivities = [],
                           availableDates,
                       }) => {
    const [sections, setSections] = useState([]);
    const [currentStep, setCurrentStep] = useState(1); // Étape 1 : Choix du parc
    const [selectedPark, setSelectedPark] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [fadeAnim] = useState(new Animated.Value(1)); // Animation pour la transition

    useEffect(() => {
        // Animation de transition entre les étapes
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    useEffect(() => {
        if (currentStep === 2 && selectedPark) {
            // Obtenir le parkId du parc sélectionné
            const selectedParkId = parkIdMapping[selectedPark];

            // Filtrer les activités en fonction du parkId, de la catégorie, de la disponibilité et du terme de recherche
            const parkActivities = activities.filter(
                (activity) =>
                    activity.parkId === selectedParkId &&
                    isAttractionAvailable(activity, availableDates)
            );

            // Filtrer par terme de recherche
            const filteredActivities = parkActivities.filter((activity) =>
                activity.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Grouper les activités par 'land'
            const groupedActivities = filteredActivities.reduce((groups, activity) => {
                const land = activity.land || 'Autres';
                if (!groups[land]) {
                    groups[land] = [];
                }
                groups[land].push(activity);
                return groups;
            }, {});

            // Convertir les groupes en sections
            const sectionsData = Object.keys(groupedActivities).map((land) => ({
                title: land,
                data: groupedActivities[land],
            }));

            // Trier les sections par nom de land
            sectionsData.sort((a, b) => a.title.localeCompare(b.title));

            setSections(sectionsData);
        }
    }, [
        activities,
        availableDates,
        selectedPark,
        searchTerm,
        currentStep,
        selectedCategoryIndex,
    ]);

    const handleParkSelection = (parkName) => {
        setSelectedPark(parkName);
        setCurrentStep(2); // Passer à l'étape 2 : Affichage des activités
    };

    const handleBackToParkSelection = () => {
        setCurrentStep(1);
        setSelectedPark(null);
        setSearchTerm('');
    };

    const getNextShowTime = (activity) => {
        if (!activity.showtimes || activity.showtimes.length === 0) return null;

        const now = new Date();

        // Transformer les showtimes en objets Date
        const upcomingShowtimes = activity.showtimes
            .map((showtime) => {
                const startTime = new Date(showtime.startTime);
                return { ...showtime, startTime };
            })
            .filter((showtime) => showtime.startTime >= now);

        if (upcomingShowtimes.length === 0) return null;

        // Trier les showtimes par heure de début
        upcomingShowtimes.sort((a, b) => a.startTime - b.startTime);

        // Prendre le premier showtime (le plus proche dans le futur)
        const nextShowtime = upcomingShowtimes[0];

        // Formater l'heure pour l'affichage
        const options = { hour: '2-digit', minute: '2-digit' };
        const formattedTime = nextShowtime.startTime.toLocaleTimeString('fr-FR', options);

        return formattedTime;
    };

    return (
        <ReactNativeModal
            isVisible={isVisible}
            onBackdropPress={onClose}
            style={styles.bottomModal}
            swipeDirection="down"
            onSwipeComplete={onClose}
            propagateSwipe={true}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.activityModalContainer}
                >
                    <View style={styles.modalHandle} />
                    {currentStep === 1 && (
                        <Animated.View style={{ opacity: fadeAnim }}>
                            {/* Étape 1 : Choix du parc */}
                            <Text style={styles.activityModalTitle}>Choisissez un parc</Text>
                            <View style={styles.parkSelectionContainer}>
                                {Object.keys(parkIcons).map((parkName) => (
                                    <TouchableOpacity
                                        key={parkName}
                                        style={styles.parkOption}
                                        onPress={() => handleParkSelection(parkName)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.parkCard}>
                                            <Image
                                                source={parkIcons[parkName]}
                                                style={styles.parkIcon}
                                            />
                                            <Text style={styles.parkName}>{parkName}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    )}
                    {currentStep === 2 && (
                        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                            {/* Étape 2 : Liste des activités */}
                            <View style={styles.headerContainer}>
                                <TouchableOpacity
                                    onPress={handleBackToParkSelection}
                                    style={styles.backButton}
                                    activeOpacity={0.7}
                                >
                                    <Image
                                        source={require('../../assets/icons/back.png')}
                                        style={styles.backIcon}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.activityModalTitle}>{selectedPark}</Text>
                            </View>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher une activité..."
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                            />
                            <ButtonGroup
                                onPress={setSelectedCategoryIndex}
                                selectedIndex={selectedCategoryIndex}
                                buttons={categories}
                                containerStyle={styles.buttonGroupContainer}
                                selectedButtonStyle={styles.selectedButtonStyle}
                                textStyle={styles.buttonGroupText}
                            />
                            {dataLoaded ? (
                                <View style={{ flex: 1 }}>
                                    <SectionList
                                        sections={sections}
                                        keyExtractor={(item, index) =>
                                            item?._id ? item._id.toString() : index.toString()
                                        }
                                        renderItem={({ item }) => {
                                            const isSelected = selectedActivities.some(
                                                (a) => a._id === item._id
                                            );
                                            const isScheduled = scheduledActivities.some(
                                                (a) => a._id === item._id
                                            );
                                            const isDisabled = isScheduled;
                                            const category = categories[selectedCategoryIndex];
                                            const imageSource = getImageForActivity(item, category);

                                            // Obtenir le prochain horaire si l'activité est un spectacle
                                            const nextShowTime =
                                                category === 'Shows' ? getNextShowTime(item) : null;

                                            return (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.activityItem,
                                                        isSelected && styles.activityItemSelected,
                                                        isDisabled && styles.activityItemDisabled,
                                                    ]}
                                                    onPress={() => {
                                                        if (!isDisabled) {
                                                            onSelectActivity(item);
                                                        }
                                                    }}
                                                    disabled={isDisabled}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={styles.activityInfo}>
                                                        <Image
                                                            source={imageSource}
                                                            style={styles.activityImage}
                                                        />
                                                        <View style={styles.activityDetails}>
                                                            <Text style={styles.activityItemText}>
                                                                {item.name}
                                                            </Text>
                                                            {item.rehab && (
                                                                <Text style={styles.unavailableText}>
                                                                    En réhabilitation
                                                                </Text>
                                                            )}
                                                            {nextShowTime && (
                                                                <Text style={styles.nextShowTime}>
                                                                    Prochain spectacle à {nextShowTime}
                                                                </Text>
                                                            )}
                                                            {item.waitTime !== undefined && (
                                                                <Text style={styles.waitTime}>
                                                                    {item.waitTime} min
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                    {(isSelected || isScheduled) && (
                                                        <Text style={styles.selectedIndicator}>
                                                            ✔
                                                        </Text>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        }}
                                        renderSectionHeader={({ section: { title } }) => (
                                            <View style={styles.sectionHeaderContainer}>
                                                <Text style={styles.sectionHeaderText}>{title}</Text>
                                            </View>
                                        )}
                                        contentContainerStyle={{ paddingBottom: 80 }}
                                    />
                                    <View style={styles.buttonContainer}>
                                        <Button
                                            title="Ajouter la sélection"
                                            onPress={onConfirm}
                                            buttonStyle={styles.addButton}
                                            disabled={selectedActivities.length === 0}
                                        />
                                    </View>
                                </View>
                            ) : (
                                <ActivityIndicator size="large" color="#0000ff" />
                            )}
                        </Animated.View>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ReactNativeModal>
    );
};

const styles = StyleSheet.create({
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    activityModalContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '100%',
        backgroundColor: 'white',
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 10,
    },
    activityModalTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    parkSelectionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    parkOption: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 10,
    },
    parkCard: {
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    parkIcon: {
        width: 120,
        height: 120,
        marginBottom: 15,
        resizeMode: 'contain',
    },
    parkName: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    backButton: {
        marginRight: 10,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
        fontSize: 16,
    },
    buttonGroupContainer: {
        marginBottom: 15,
        borderRadius: 10,
    },
    selectedButtonStyle: {
        backgroundColor: '#007AFF',
    },
    buttonGroupText: {
        fontSize: 16,
    },
    sectionHeaderContainer: {
        backgroundColor: '#F0F0F0',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activityItemSelected: {
        backgroundColor: '#e6f7ff',
    },
    activityItemDisabled: {
        backgroundColor: '#e0e0e0',
    },
    activityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    activityImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    activityDetails: {
        flex: 1,
    },
    activityItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    unavailableText: {
        fontSize: 14,
        color: '#E74C3C',
    },
    waitTime: {
        fontSize: 14,
        color: '#555',
    },
    nextShowTime: {
        fontSize: 14,
        color: '#555',
    },
    selectedIndicator: {
        fontSize: 18,
        color: '#007AFF',
        paddingRight: 10,
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 10,
    },
    buttonContainer: {
        paddingBottom: 20,
    },
});

export default ActivityModal;
