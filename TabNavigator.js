import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomNav from './components/mobileNavbar';
import HomeScreen from "./screens/HomeScreen";
import HoursScreen from './screens/HoursScreen';
import AttractionsScreen from './screens/AttractionsScreen';
import ShowsScreen from './screens/SpectacleScreen';
import MagicAITripScreen from './screens/MagicAITripScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator tabBar={(props) => <BottomNav {...props} />}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Hours" component={HoursScreen} />
            <Tab.Screen name="Attractions" component={AttractionsScreen} />
            <Tab.Screen name="Spectacle" component={ShowsScreen} />
            <Tab.Screen name="MagicAITrip" component={MagicAITripScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
