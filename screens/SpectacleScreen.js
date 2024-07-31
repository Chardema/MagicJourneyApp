import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import MapView, { Marker, Callout } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { toggleFavoriteShow} from "../redux/actions/actions";
import Navbar from "../components/Navbar";
import BottomNav from "../components/mobileNavbar";
import { formatImageName, importImage, useWindowWidth, fetchFullShowInfo } from "../components/utils";

const ShowsScreen = () => {
    const [showsData, setShowsData] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const width = useWindowWidth();
    const favorites = useSelector(state => state.favorites.favorites);
    const dispatch = useDispatch();

    const handleToggleFavorite = async (show) => {
        const isFavorited = favorites.some(fav => fav.id === show.id);

        let showWithFullInfo = show;
        if (!isFavorited) {
            // Récupérer les informations complètes uniquement si le spectacle n'est pas déjà dans les favoris
            showWithFullInfo = await fetchFullShowInfo(show.id) || show; // Utiliser les données existantes comme fallback
        }

        // Enrichir le spectacle avec un type avant de dispatcher
        const showWithEntityType = { ...showWithFullInfo, type: 'SHOW' };
        dispatch(toggleFavoriteShow(showWithEntityType));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://eurojourney.azurewebsites.net/api/shows');
                const currentDateTime = new Date();
                const showsDataWithNextShowtime = response.data.map(show => {
                    const nextShowtime = show.showtimes
                        .filter(time => new Date(time.startTime) > currentDateTime)
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
                    return { ...show, showtimes: nextShowtime ? [nextShowtime] : [] };
                }).filter(show => show.showtimes.length > 0);
                setShowsData(showsDataWithNextShowtime);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const compareShowtimes = (a, b) => new Date(a.showtimes[0]?.startTime).getTime() - new Date(b.showtimes[0]?.startTime).getTime();

    return (
        <View style={styles.container}>
            {width > 768 && <Navbar />}
            <View style={styles.modeSwitch}>
                <Button title="Liste" onPress={() => setViewMode('list')} color={viewMode === 'list' ? '#007BFF' : '#ddd'} />
                <Button title="Plan" onPress={() => setViewMode('map')} color={viewMode === 'map' ? '#007BFF' : '#ddd'} />
            </View>
            <Text style={styles.title}>Spectacles prévus aujourd'hui</Text>
            <Text style={styles.info}>Pour plus de précision, n'hésitez pas à consulter l'application Disneyland Paris officielle.</Text>
            {viewMode === 'list' ? (
                <ScrollView contentContainerStyle={styles.showsList}>
                    {showsData.length > 0 ? showsData.sort(compareShowtimes).map((show) => (
                        <View key={show.id} style={styles.card}>
                            <Image source={importImage(formatImageName(show.name))} style={styles.showImage} />
                            <Text style={styles.showName}>{show.name}</Text>
                            {show.showtimes.length > 0 ? (
                                <Text style={styles.showStatus}>Prochaine représentation : {new Date(show.showtimes[0].startTime).toLocaleTimeString()}</Text>
                            ) : (
                                <Text style={styles.noShowtimes}>Aucune représentation prévue.</Text>
                            )}
                            <TouchableOpacity style={styles.favoriteButton} onPress={() => handleToggleFavorite(show)}>
                                <FontAwesome
                                    name={favorites.some(fav => fav.id === show.id && fav.type === 'SHOW') ? 'heart' : 'heart-o'}
                                    size={24}
                                    color="red"
                                />
                            </TouchableOpacity>
                        </View>
                    )) : <Text>Aucun spectacle disponible pour le moment.</Text>}
                </ScrollView>
            ) : (
                <MapView
                    style={{ height: '80vh', width: '100%' }}
                    initialRegion={{
                        latitude: 48.872,
                        longitude: 2.775,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    {showsData.map((show) => show.coordinates && show.coordinates.length === 2 && (
                        <Marker
                            key={show.id}
                            coordinate={{ latitude: show.coordinates[0], longitude: show.coordinates[1] }}
                            title={show.name}
                            description={`Prochaine représentation : ${new Date(show.showtimes[0]?.startTime).toLocaleTimeString()}`}
                        >
                            <Callout>
                                <View>
                                    <Text>{show.name}</Text>
                                    <Text>Prochaine représentation : {new Date(show.showtimes[0]?.startTime).toLocaleTimeString()}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            )}
            <BottomNav />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        padding: 10,
    },
    modeSwitch: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    info: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    showsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        width: '48%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    showImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
    },
    showName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    showStatus: {
        color: '#007BFF',
        marginBottom: 10,
    },
    noShowtimes: {
        color: '#999',
        marginBottom: 10,
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default ShowsScreen;
