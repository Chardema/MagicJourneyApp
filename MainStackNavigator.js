import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SurveyScreen from "./screens/SurveySreen"; // Chemin vers SurveyScreen
import TabNavigator from './TabNavigator'; // Le Tab.Navigator existant
import HomeScreen from "./screens/HomeScreen"; // Importer votre nouveau composant

const Stack = createStackNavigator();

const MainStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SurveyScreen" component={SurveyScreen} />
            <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
    );
};

export default MainStackNavigator;