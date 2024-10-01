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
} from 'react-native';
import { Button, ButtonGroup } from 'react-native-elements';
import ReactNativeModal from 'react-native-modal';
import {
    isAttractionAvailable,
    getAvailableDatesForAttraction,
} from '../utils/attractionAvailability';

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

    useEffect(() => {
        // Filtrer les activités en fonction de leur disponibilité
        const filteredActivities = activities.filter((activity) =>
            isAttractionAvailable(activity, availableDates)
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
    }, [activities, availableDates]);

    return (
        <ReactNativeModal
            isVisible={isVisible}
            onBackdropPress={onClose}
            style={styles.bottomModal}
            swipeDirection="down"
            onSwipeComplete={onClose}
            propagateSwipe={true}
        >
            <View style={styles.activityModalContainer}>
                <View style={styles.modalHandle} />
                <Text style={styles.activityModalTitle}>Sélectionnez des activités</Text>
                <ButtonGroup
                    onPress={setSelectedCategoryIndex}
                    selectedIndex={selectedCategoryIndex}
                    buttons={categories}
                    containerStyle={styles.buttonGroupContainer}
                    selectedButtonStyle={styles.selectedButtonStyle}
                    textStyle={styles.buttonGroupText}
                />
                {dataLoaded ? (
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

                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.activityItem,
                                        isSelected && styles.activityItemSelected,
                                        isDisabled && styles.activityItemDisabled,
                                    ]}
                                    onPress={() => !isDisabled && onSelectActivity(item)}
                                    disabled={isDisabled}
                                >
                                    <View style={styles.activityInfo}>
                                        <Image source={imageSource} style={styles.activityImage} />
                                        <View style={styles.activityDetails}>
                                            <Text style={styles.activityItemText}>{item.name}</Text>
                                            {item.rehab && (
                                                <Text style={styles.unavailableText}>
                                                    En réhabilitation
                                                </Text>
                                            )}
                                            {item.waitTime !== undefined && (
                                                <Text style={styles.waitTime}>
                                                    Temps d'attente : {item.waitTime} min
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    {(isSelected || isScheduled) && (
                                        <Text style={styles.selectedIndicator}>✔</Text>
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
                ) : (
                    <ActivityIndicator size="large" color="#0000ff" />
                )}
                <Button
                    title="Ajouter la sélection"
                    onPress={onConfirm}
                    buttonStyle={styles.addButton}
                    disabled={selectedActivities.length === 0}
                />
            </View>
        </ReactNativeModal>
    );
};

const styles = StyleSheet.create({
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    activityModalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
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
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
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
});

export default ActivityModal;
