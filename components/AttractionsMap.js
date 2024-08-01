import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';

const AttractionsMap = ({ attractions, getWaitTimeColor }) => {
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [route, setRoute] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMessage('Permission to access location was denied');
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                setErrorMessage('Error accessing location.');
            }
        })();
    }, []);

    const calculateRoute = useCallback(async (start, end) => {
        try {
            const apiKey = "5b3ce3597851110001cf62483f9fb5d6194f46139e925f786fde38a0";
            const response = await axios.get(`https://api.openrouteservice.org/v2/directions/foot-walking`, {
                params: {
                    api_key: apiKey,
                    start: `${start.longitude},${start.latitude}`,
                    end: `${end[1]},${end[0]}`,
                }
            });

            if (response.data.features && response.data.features.length > 0) {
                const coordinates = response.data.features[0].geometry.coordinates.map(coord => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
                setRoute(coordinates);
            } else {
                setErrorMessage('No route found.');
                setRoute([]);
            }
        } catch (error) {
            setErrorMessage('Error calculating route.');
            setRoute([]);
        }
    }, []);

    useEffect(() => {
        if (userLocation && selectedAttraction) {
            calculateRoute(userLocation, selectedAttraction.coordinates);
        }
    }, [userLocation, selectedAttraction, calculateRoute]);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 48.872,
                    longitude: 2.775,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
            >
                {attractions.map((attraction) =>
                    attraction.coordinates ? (
                        <Marker
                            key={attraction._id}
                            coordinate={{
                                latitude: attraction.coordinates[0],
                                longitude: attraction.coordinates[1],
                            }}
                            pinColor={getWaitTimeColor ? getWaitTimeColor(attraction) : 'red'}
                            onPress={() => setSelectedAttraction(attraction)}
                        >
                            <Callout>
                                <View>
                                    <Text>{attraction.name}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    ) : null
                )}
                {route.length > 0 && (
                    <Polyline
                        coordinates={route}
                        strokeColor="blue"
                        strokeWidth={3}
                    />
                )}
            </MapView>
            {errorMessage ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    errorContainer: {
        position: 'absolute',
        bottom: 20,
        left: '10%',
        right: '10%',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    errorMessage: {
        color: 'red',
    },
});

export default AttractionsMap;
