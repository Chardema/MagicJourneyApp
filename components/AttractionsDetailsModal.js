// AttractionDetailsModal.js
import React from 'react';
import { View, Text, Modal, StyleSheet, Image, TouchableOpacity } from 'react-native';

const AttractionDetailsModal = ({ visible, attraction, onClose }) => {
    // Vérifier si attraction n'est pas null avant de rendre le contenu
    if (!attraction) {
        return null; // Retourne null si attraction est null pour éviter l'erreur
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Image
                        source={{ uri: attraction.imageUrl || 'https://via.placeholder.com/200' }} // Utilise une image par défaut si imageUrl est manquant
                        style={styles.attractionImage}
                    />
                    <Text style={styles.attractionName}>{attraction.name || 'Nom non disponible'}</Text>
                    <Text style={styles.attractionDescription}>{attraction.description || 'Description non disponible'}</Text>
                    <Text style={styles.attractionDescription}>{attraction.land || 'Description non disponible'}</Text>
                    <Text style={styles.attractionPrice}>Prix du Premier Access: {attraction.PAprice !== undefined ? `${attraction.PAprice}€` : 'Non disponible'}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Fermer</Text>
                    </TouchableOpacity>
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
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    attractionImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    attractionName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    attractionDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    attractionPrice: {
        fontSize: 16,
        color: '#3498DB',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#3498DB',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AttractionDetailsModal;
