// TripPlanModal.js

import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Button, CheckBox } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const TripPlanModal = ({
                           visible,
                           onClose,
                           onSave,
                           startDate,
                           setStartDate,
                           duration,
                           setDuration,
                           hasExtraMagicHours,
                           setHasExtraMagicHours,
                       }) => {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirmDate = (date) => {
        setStartDate(date);
        hideDatePicker();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Planifier votre séjour</Text>
                    <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
                        <Text style={styles.datePickerText}>
                            {startDate ? `Début du séjour : ${startDate.toLocaleDateString()}` : 'Sélectionner la date de début'}
                        </Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirmDate}
                        onCancel={hideDatePicker}
                    />
                    <TextInput
                        placeholder="Durée du séjour (en jours)"
                        value={duration}
                        onChangeText={setDuration}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <CheckBox
                        title="Avez-vous accès aux Extra Magic Hours ?"
                        checked={hasExtraMagicHours}
                        onPress={() => setHasExtraMagicHours(!hasExtraMagicHours)}
                        containerStyle={styles.checkboxContainer}
                        textStyle={styles.checkboxText}
                    />
                    <Button title="Valider" onPress={onSave} buttonStyle={styles.validateButton} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
    },
    datePickerButton: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        width: '100%',
    },
    datePickerText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 15,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        textAlign: 'center',
    },
    checkboxContainer: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        margin: 0,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 20,
    },
    checkboxText: {
        fontSize: 16,
        color: '#333',
    },
    validateButton: {
        backgroundColor: '#34C759',
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 20,
        marginHorizontal: 20,
    },
});

export default TripPlanModal;
