import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomNav from './components/mobileNavbar';
import HomeScreen from "./screens/HomeScreen";
import HoursScreen from './screens/HoursScreen';
import AttractionsScreen from './screens/AttractionsScreen';
import ShowsScreen from './screens/SpectacleScreen';
import MagicAITripScreen from './screens/MagicAITripScreen';
import ReturnVisitorPage from './screens/ReturnVisitorPage'; // Importer ReturnVisitorPage
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const [visitedDisney, setVisitedDisney] = useState(null);

    // Récupérer les préférences de l'utilisateur (s'il a déjà visité Disneyland)
    useEffect(() => {
        AsyncStorage.getItem('userPreferences').then((data) => {
            if (data) {
                const preferences = JSON.parse(data);
                setVisitedDisney(preferences.visitedDisney);
            }
        });
    }, []);

    return (
        <Tab.Navigator tabBar={(props) => <BottomNav {...props} />}>
            {/* Si l'utilisateur a déjà visité Disneyland, afficher ReturnVisitorPage comme écran d'accueil */}
            {visitedDisney === 'Oui' ? (
                <Tab.Screen name="Retour" component={ReturnVisitorPage} />
            ) : (
                <Tab.Screen name="Home" component={HomeScreen} />
            )}
            <Tab.Screen name="Hours" component={HoursScreen} />
            <Tab.Screen name="Attractions" component={AttractionsScreen} />
            <Tab.Screen name="Spectacle" component={ShowsScreen} />
            <Tab.Screen name="MagicAITrip" component={MagicAITripScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
