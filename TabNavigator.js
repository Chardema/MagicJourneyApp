// TabNavigator.js
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomNav from './components/mobileNavbar';
import HomeScreen from './screens/HomeScreen';
import AttractionsScreen from './screens/AttractionsScreen';
import ShowsScreen from './screens/SpectacleScreen';
import MagicAITripScreen from './screens/MagicAITripScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const [visitedDisney, setVisitedDisney] = useState(null);

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const data = await AsyncStorage.getItem('userPreferences');
                if (data) {
                    const preferences = JSON.parse(data);
                    setVisitedDisney(preferences.visitedDisney);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des préférences utilisateur:', error);
            }
        };
        loadPreferences();
    }, []);

    return (
        <Tab.Navigator tabBar={(props) => <BottomNav {...props} />}>
            <Tab.Screen name="Ma journée" component={HomeScreen} options={{headerShown: false}} />
            <Tab.Screen name="Attractions" component={AttractionsScreen} />
            <Tab.Screen name="Spectacle" component={ShowsScreen} />
            <Tab.Screen name="MagicAITrip" component={MagicAITripScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
