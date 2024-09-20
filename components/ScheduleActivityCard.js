import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { attractionImages, showImagesMap, restaurantImagesMap, normalizeName } from './utils';

const ScheduledActivityCard = ({ activity }) => {
    const activityName = activity?.name || 'Activité inconnue';
    const normalizedItemName = normalizeName(activityName);

    // Déterminer la source de l'image en fonction de la catégorie ou du type d'entité
    let imageSource;

    // Vérification de la catégorie ou du type de l'activité
    if (activity.category === 'Shows' || activity.entityType === 'SHOW') {
        imageSource = showImagesMap[normalizedItemName] || showImagesMap['default.jpg'];
    } else if (activity.category === 'Restaurants' || activity.entityType === 'RESTAURANT') {
        imageSource = restaurantImagesMap[normalizedItemName] || restaurantImagesMap['default.jpg'];
    } else {
        // Par défaut, on utilise l'image des attractions
        imageSource = attractionImages[normalizedItemName] || attractionImages['default.jpg'];
    }

    // Déterminer le temps d'attente à afficher
    let waitTimeDisplay;
    if (activity.status === 'CLOSED') {
        waitTimeDisplay = 'Fermé';
    } else if (activity.waitTime === null && activity.status === 'OPERATING') {
        waitTimeDisplay = '0 min';
    } else if (activity.waitTime === null && activity.status === 'DOWN') {
        waitTimeDisplay = `Indisponible`;
    } else {
        waitTimeDisplay = `${activity.waitTime} min`;
    }

    return (
        <View style={styles.card}>
            <Image source={imageSource} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{activityName}</Text>
                {activity.category && (
                    <Text style={styles.category}>{activity.category}</Text>
                )}
            </View>
            {activity.waitTime !== undefined && (
                <View style={styles.waitTimeContainer}>
                    <Text style={styles.waitTime}>Temps d'attente</Text>
                    <Text style={styles.waitTimeLarge}>{waitTimeDisplay}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 10,
        marginVertical: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 15,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    category: {
        fontSize: 14,
        color: '#888',
    },
    waitTimeContainer: {
        alignItems: 'flex-end',
    },
    waitTime: {
        fontSize: 14,
        color: '#888',
    },
    waitTimeLarge: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default ScheduledActivityCard;
