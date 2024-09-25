// ActivityModal.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, ButtonGroup } from 'react-native-elements';
import ReactNativeModal from 'react-native-modal';
import { useSelector } from 'react-redux';
import {getCategories, getFilteredRideData} from "../../redux/selector";

const ActivityModal = ({
                           isVisible,
                           selectedCategoryIndex,
                           setSelectedCategoryIndex,
                           selectedActivities,
                           onSelectActivity,
                           onConfirm,
                           dataLoaded,
                           onClose,
                           getImageForActivity,
                       }) => {
    // Utilisez useSelector pour récupérer les catégories et les activités filtrées depuis Redux
    const categories = useSelector(getCategories);
    const activities = useSelector(getFilteredRideData);

    // État pour suivre la dernière mise à jour (optionnel)
    const [lastUpdated, setLastUpdated] = useState(null);

    // Mettre à jour l'heure de dernière mise à jour chaque fois que les activités changent
    useEffect(() => {
        if (dataLoaded) {
            setLastUpdated(new Date());
        }
    }, [activities, dataLoaded]);

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
                    <>
                        <FlatList
                            data={activities}
                            keyExtractor={(item, index) => (item?._id ? item._id.toString() : index.toString())}
                            renderItem={({ item }) => {
                                const isSelected = selectedActivities.some(a => a._id === item._id);
                                const category = categories[selectedCategoryIndex];
                                const imageSource = getImageForActivity(item, category);

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.activityItem,
                                            isSelected && styles.activityItemSelected,
                                        ]}
                                        onPress={() => onSelectActivity(item)}
                                    >
                                        <View style={styles.activityInfo}>
                                            <Image source={imageSource} style={styles.activityImage} />
                                            <View style={styles.activityDetails}>
                                                <Text style={styles.activityItemText}>{item.name}</Text>
                                                {item.waitTime !== undefined && (
                                                    <Text style={styles.waitTime}>
                                                        Temps d'attente : {item.waitTime} min
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        {isSelected && <Text style={styles.selectedIndicator}>✔</Text>}
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        <Button
                            title="Ajouter les activités sélectionnées"
                            onPress={onConfirm}
                            disabled={selectedActivities.length === 0}
                            buttonStyle={styles.addButton}
                        />
                        {lastUpdated && (
                            <Text style={styles.lastUpdated}>
                                Dernière mise à jour : {lastUpdated.toLocaleTimeString()}
                            </Text>
                        )}
                    </>
                ) : (
                    <ActivityIndicator size="large" color="#0000ff" />
                )}
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
        marginTop: 20,
        marginHorizontal: 20,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#888',
        textAlign: 'right',
        marginTop: 5,
    },
});

export default ActivityModal;
