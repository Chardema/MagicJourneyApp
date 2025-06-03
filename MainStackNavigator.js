// MainStackNavigator.js
import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SurveyScreen from "./screens/SurveySreen";
import TabNavigator from './TabNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

const MainStackNavigator = () => {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const checkUserPreferences = async () => {
            try {
                const storedPreferences = await AsyncStorage.getItem('userResponses');
                if (storedPreferences) {
                    setInitialRoute('MainTabs'); // Naviguer vers les onglets principaux
                } else {
                    setInitialRoute('SurveyScreen');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des préférences utilisateur:', error);
            }
        };
        checkUserPreferences();
    }, []);

    if (!initialRoute) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SurveyScreen" component={SurveyScreen} />
            {/* Retirer HomeScreen du stack */}
            <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
    );
};

export default MainStackNavigator;
