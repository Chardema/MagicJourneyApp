// AttractionsScreen.js

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setAttractions, setWaitTimes } from '../redux/actions/actions';
import { SafeAreaView } from 'react-native-safe-area-context';
import AttractionDetailsModal from "../components/AttractionsDetailsModal";
import {
    attractionImages,
    normalizeName,
} from '../components/utils';

const AttractionsScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [isAttractionModalVisible, setAttractionModalVisible] = useState(false);

    const attractions = useSelector((state) => state.attractions.attractions) || [];
    const waitTimes = useSelector((state) => state.waitTimes) || {};
    const dataLoaded = useSelector((state) => state.attractions.isLoaded);

    useEffect(() => {
        dispatch(setAttractions());
        dispatch(setWaitTimes());
    }, [dispatch]);

    useEffect(() => {
        // Mettre à jour les temps d'attente toutes les 5 minutes
        const interval = setInterval(() => {
            dispatch(setWaitTimes());
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [dispatch]);

    if (!dataLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498DB" />
            </View>
        );
    }

    const filteredAttractions = attractions.filter((attraction) =>
        attraction.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getImageForAttraction = (attraction) => {
        if (!attraction || !attraction.name) {
            return require('../assets/default.jpg');
        }

        const normalizedName = normalizeName(attraction.name);
        return attractionImages[normalizedName] || attractionImages['default.jpg'];
    };

    const renderItem = ({ item }) => {
        const waitTime = waitTimes[item._id] !== undefined ? waitTimes[item._id] : 'N/A';

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onLongPress={() => {
                    setSelectedAttraction(item);
                    setAttractionModalVisible(true);
                }}
            >
                <Image
                    source={getImageForAttraction(item)}
                    style={styles.itemImage}
                />
                <View style={styles.itemTextContainer}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemWaitTime}>
                        Temps d'attente : {waitTime !== null ? `${waitTime} min` : 'N/A'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <TextInput
                placeholder="Rechercher une attraction..."
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            <FlatList
                data={filteredAttractions}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
            />
            <AttractionDetailsModal
                visible={isAttractionModalVisible}
                attraction={selectedAttraction}
                onClose={() => setAttractionModalVisible(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333333',
        textAlign: 'center',
    },
    searchInput: {
        padding: 12,
        fontSize: 16,
        borderColor: '#DDDDDD',
        borderWidth: 1,
        borderRadius: 8,
        marginHorizontal: 10,
        marginVertical: 10,
    },
    listContent: {
        paddingBottom: 100,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#F8F8F8',
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 15,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    itemWaitTime: {
        fontSize: 16,
        color: '#555555',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AttractionsScreen;
