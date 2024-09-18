import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const AttractionModal = ({ isOpen, onClose, attractionDetails }) => {
    const [averageWaitTimes, setAverageWaitTimes] = useState({ morning: null, afternoon: null, evening: null });


    if (!isOpen) return null;

    const allWaitTimesZero = () => {
        const { morning, afternoon, evening } = averageWaitTimes;
        return morning === null && afternoon === null && evening === null;
    };

    const getRecommendation = () => {
        if (attractionDetails.status === 'CLOSED' && allWaitTimesZero()) {
            return "Cette attraction est fermée pour le moment.";
        }
        if (allWaitTimesZero()) {
            return "Cette attraction est faisable toute la journée !";
        }

        const { morning, afternoon, evening } = averageWaitTimes;
        let recommendation = null;
        let minWaitTime = null;

        if (morning !== null && (minWaitTime === null || morning < minWaitTime)) {
            minWaitTime = morning;
            recommendation = "Nous vous recommandons de faire cette attraction le matin.";
        }
        if (afternoon !== null && (minWaitTime === null || afternoon < minWaitTime)) {
            minWaitTime = afternoon;
            recommendation = "Nous vous recommandons de faire cette attraction l'après-midi.";
        }
        if (evening !== null && (minWaitTime === null || evening < minWaitTime)) {
            minWaitTime = evening;
            recommendation = "Nous vous recommandons de faire cette attraction le soir.";
        }

        return recommendation;
    };

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeModal} onPress={onClose}>
                        <Text style={styles.closeText}>×</Text>
                    </TouchableOpacity>
                    <Text style={styles.attractionTitle}>{attractionDetails.name}</Text>
                    <Text style={styles.attractionDescription}>{attractionDetails.description}</Text>
                    {attractionDetails.status === 'CLOSED' && allWaitTimesZero() ? (
                        <View style={styles.hint}>
                            <Text>Cette attraction est fermée pour le moment.</Text>
                        </View>
                    ) : allWaitTimesZero() ? (
                        <View style={styles.hint}>
                            <FontAwesome name="lightbulb-o" style={styles.hintIcon} />
                            <Text>Cette attraction est faisable toute la journée !</Text>
                        </View>
                    ) : (
                        <View style={styles.waitTimesTable}>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>Période</Text>
                                <Text style={styles.tableCell}>Temps d'attente moyen (minutes)</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>Matin</Text>
                                <Text style={styles.tableCell}>{averageWaitTimes.morning !== null ? averageWaitTimes.morning : 'N/A'}</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>Après-midi</Text>
                                <Text style={styles.tableCell}>{averageWaitTimes.afternoon !== null ? averageWaitTimes.afternoon : 'N/A'}</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>Soir</Text>
                                <Text style={styles.tableCell}>{averageWaitTimes.evening !== null ? averageWaitTimes.evening : 'Fermé'}</Text>
                            </View>
                        </View>
                    )}
                    <Text>{getRecommendation()}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        width: '90%',
        maxWidth: 600,
        alignItems: 'center',
    },
    closeModal: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    closeText: {
        fontSize: 24,
        color: '#333',
    },
    attractionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    attractionDescription: {
        marginBottom: 20,
        textAlign: 'center',
    },
    waitTimesTable: {
        width: '100%',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    hint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    hintIcon: {
        marginRight: 10,
        fontSize: 24,
        color: '#f39c12',
    },
});

export default AttractionModal;
