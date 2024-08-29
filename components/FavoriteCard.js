import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from "react-redux";
import { importImage, formatImageName } from './utils';
import Icon from 'react-native-vector-icons/FontAwesome';

const FavoriteCard = ({ favorite, onRemove, isMinimalistMode, onToggleFavorite }) => {
    if (!favorite) return null;

    // Log pour voir les données reçues par le composant
    console.log('Favorite:', favorite);

    const [nextShowtime, setNextShowtime] = useState(null);
    const favorites = useSelector(state => state.favorites.favorites);

    useEffect(() => {
        if (favorite.type === 'SHOW' && favorite.showtimes) {
            const now = new Date();
            const futureShowtimes = favorite.showtimes.filter(showtime =>
                new Date(showtime.startTime) > now
            ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            setNextShowtime(futureShowtimes.length > 0 ? futureShowtimes[0] : null);
        }
    }, [favorite]);

    const isFavorite = favorites.some(fav => fav.id === favorite.id);

    return (
        <View style={styles.cardContainer}>
            <Image style={styles.image} source={importImage(formatImageName(favorite.name))} />
            <View style={styles.infoContainer}>
                <View>
                    <Text style={styles.title}>{favorite.name}</Text>
                    <Text style={styles.subtitle}>{favorite.land}</Text>
                </View>
                <View style={styles.waitTimeContainer}>
                    <View style={[styles.waitTimeIndicator, styles[getWaitTimeColor(favorite)]]} />
                    <Text style={styles.waitTimeText}>
                        {favorite.status === 'CLOSED' ? 'Fermée' :
                            favorite.status === 'DOWN' ? 'Indispo' :
                                favorite.waitTime === null ? 'Sans file' : `${favorite.waitTime} min`}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => onRemove(favorite)}>
                <Icon name="trash" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );
};

const getWaitTimeColor = (favorite) => {
    if (favorite.status === 'CLOSED' || favorite.status === 'DOWN') {
        return 'gray';
    } else if (favorite.waitTime <= 15) {
        return 'green';
    } else if (favorite.waitTime <= 30) {
        return 'yellow';
    } else {
        return 'red';
    }
};


const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 2,
        justifyContent: 'space-between',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#777',
        marginTop: 4,
    },
    waitTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    waitTimeIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    green: {
        backgroundColor: 'green',
    },
    yellow: {
        backgroundColor: 'orange',
    },
    red: {
        backgroundColor: 'red',
    },
    gray: {
        backgroundColor: 'gray',
    },
    waitTimeText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default FavoriteCard;
