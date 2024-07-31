// components/AttractionsMap.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';

const AttractionsMap = ({ attractions, getWaitTimeColor }) => {
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [route, setRoute] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [routeDuration, setRouteDuration] = useState(null);

    useEffect(() => {
        const requestLocationPermission = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMessage('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        };

        requestLocationPermission();
    }, []);

    useEffect(() => {
        if (userLocation && selectedAttraction) {
            calculateRoute([userLocation.latitude, userLocation.longitude], selectedAttraction.coordinates);
        }
    }, [userLocation, selectedAttraction]);

    const handleMarkerPress = (attraction) => {
        setSelectedAttraction(attraction);
        calculateRoute([userLocation.latitude, userLocation.longitude], attraction.coordinates);
    };

    const calculateRoute = async (startCoordinates, destinationCoordinates) => {
        try {
            const apiKey = process.env.apiurl;
            const response = await axios.get(`https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${startCoordinates[1]},${startCoordinates[0]}&end=${destinationCoordinates[1]},${destinationCoordinates[0]}`);
            if (response.data.features && response.data.features.length > 0) {
                const coordinates = response.data.features[0].geometry.coordinates;
                const latLngs = coordinates.map(coord => ({ latitude: coord[1], longitude: coord[0] }));
                setRoute(latLngs);

                // Mise à jour de la durée de l'itinéraire
                const durationSeconds = response.data.features[0].properties.segments.reduce((total, segment) => total + segment.duration, 0);
                const durationMinutes = Math.round(durationSeconds / 60); // Conversion en minutes
                setRouteDuration(durationMinutes);

                setErrorMessage('');
            } else {
                setErrorMessage("Aucun itinéraire trouvé.");
                setRoute(null);
                setRouteDuration(null);
            }
        } catch (error) {
            console.error('Erreur lors du calcul de l’itinéraire :', error);
            setErrorMessage("Erreur lors du calcul de l'itinéraire.");
            setRoute(null);
            setRouteDuration(null);
        }
    };

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
                    attraction.coordinates && Array.isArray(attraction.coordinates) && attraction.coordinates.length === 2 ? (
                        <Marker
                            key={attraction.id}
                            coordinate={{
                                latitude: attraction.coordinates[0],
                                longitude: attraction.coordinates[1],
                            }}
                            pinColor={getWaitTimeColor(attraction)}
                            onPress={() => handleMarkerPress(attraction)}
                        >
                            <MapView.Callout>
                                <View>
                                    <Text>{attraction.name}</Text>
                                    {selectedAttraction && selectedAttraction.id === attraction.id && routeDuration && (
                                        <Text>Durée à pied : {routeDuration} min</Text>
                                    )}
                                </View>
                            </MapView.Callout>
                        </Marker>
                    ) : null
                )}
                {route && (
                    <Polyline
                        coordinates={route}
                        strokeColor="blue"
                        strokeWidth={3}
                    />
                )}
            </MapView>
            {errorMessage && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
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
