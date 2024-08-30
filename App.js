import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import store from './redux/store';
import MainStackNavigator from './MainStackNavigator'; // Import du MainStackNavigator

const App = () => {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <MainStackNavigator />
            </NavigationContainer>
        </Provider>
    );
};

export default App;
