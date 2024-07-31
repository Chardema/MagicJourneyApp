import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux'; // Import du Provider de react-redux
import store from './redux/store'; // Chemin vers ton store Redux
import BottomNav from './components/mobileNavbar';
import HomeScreen from "./screens/HomeScreen";
import HoursScreen from './screens/HoursScreen';
import AttractionsScreen from './screens/AttractionsScreen';
import ShowsScreen from './screens/SpectacleScreen';
import MagicAITripScreen from './screens/MagicAITripScreen';

const Tab = createBottomTabNavigator();

const App = () => {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <Tab.Navigator tabBar={(props) => <BottomNav {...props} />}>
                    <Tab.Screen name="Home" component={HomeScreen} />
                    <Tab.Screen name="Hours" component={HoursScreen} />
                    <Tab.Screen name="Attractions" component={AttractionsScreen} />
                    <Tab.Screen name="Spectacle" component={ShowsScreen} />
                    <Tab.Screen name="MagicAITrip" component={MagicAITripScreen} />
                </Tab.Navigator>
            </NavigationContainer>
        </Provider>
    );
};

export default App;
