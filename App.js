import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import MainStackNavigator from './MainStackNavigator';
import store from './redux/store'; // Assurez-vous que le store est correctement configuré et exporté

const App = () => {
    return (
        // Fournir le store Redux à toute l'application
        <Provider store={store}>
            <NavigationContainer>
                <MainStackNavigator />
            </NavigationContainer>
        </Provider>
    );
};

export default App;
