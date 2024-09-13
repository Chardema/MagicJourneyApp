// AttractionCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { attractionImages, normalizeName } from './utils'; // Ajustez le chemin

const AttractionCard = ({ item, type = 'attraction', onToggleFavorite, onDetailsPress, isFavorite }) => {
    const normalizedItemName = normalizeName(item.name);
    const imageSource = require('../assets/default.jpg');

    console.log('Item Name:', item.name);
    console.log('Normalized Item Name:', normalizedItemName);
    console.log('Image Source:', imageSource);

    return (
        <View style={styles.card}>
            <View style={styles.imageWrapper}>
                <Image
                    source={imageSource}
                    style={styles.imgAttraction}
                />
                {onToggleFavorite && (
                    <TouchableOpacity
                        style={styles.favoriteIconWrapper}
                        onPress={() => onToggleFavorite(item._id)}
                    >
                        <Icon
                            name="heart"
                            size={30}
                            color={isFavorite ? 'red' : 'white'}
                            style={{ opacity: isFavorite ? 1 : 0.5 }}
                        />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.cardText}>
                <Text style={styles.attractionName}>{item.name}</Text>
                <Text style={styles.attractionLand}>{item.land}</Text>
                {onDetailsPress && (
                    <TouchableOpacity
                        onPress={() => onDetailsPress(item)}
                        style={styles.detailsButton}
                    >
                        <Text style={styles.detailsButtonText}>Détails</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.waitTime}>
                <Text>
                    {type === 'show' ? (
                        item.showtimes && item.showtimes.length > 0
                            ? `Prochaine représentation : ${new Date(item.showtimes[0].startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                            : 'Aucune représentation prévue.'
                    ) : (
                        item.status === 'DOWN'
                            ? 'Indispo'
                            : item.status === 'CLOSED'
                                ? 'Fermée'
                                : item.waitTime === null
                                    ? 'Sans file'
                                    : `${item.waitTime} min`
                    )}
                </Text>
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
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    favoriteIconWrapper: {
        position: 'absolute',
        top: 10,
        right: 10,
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
    waitTime: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 15,
        padding: 5,
    },
    detailsButton: {
        marginTop: 10,
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    detailsButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
});

export default AttractionCard;
