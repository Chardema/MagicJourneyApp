import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { attractionImages, normalizeName } from './utils';

const AttractionCard = ({ item }) => {
    const normalizedItemName = normalizeName(item.name);
    const imageSource = attractionImages[normalizedItemName] || attractionImages['default.jpg'];

    // Ajoutez un log pour vérifier comment le nom de l'image est formaté
    console.log('Normalized Item Name:', normalizedItemName);
    console.log('Image Source:', imageSource);

    return (
        <View style={styles.card}>
            <View style={styles.imageWrapper}>
                <Image
                    source={imageSource}
                    style={styles.imgAttraction}
                />
            </View>
            <View style={styles.cardText}>
                <Text style={styles.attractionName}>{item.name}</Text>
                <Text style={styles.attractionLand}>{item.land}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        width: '48%',
        alignItems: 'center',
    },
    imageWrapper: {
        position: 'relative',
    },
    imgAttraction: {
        width: 200, // Taille fixe pour tester
        height: 200, // Taille fixe pour tester
        borderRadius: 8,
        marginBottom: 10,
    },
    cardText: {
        alignItems: 'center',
    },
    attractionName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333333',
        textAlign: 'center',
    },
    attractionLand: {
        fontSize: 14,
        color: '#777777',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default AttractionCard;
