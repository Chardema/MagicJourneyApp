// App.js

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import MainStackNavigator from './MainStackNavigator';
import store from './redux/store';
import AppInitializer from "./components/AppInitializer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import UpdateModal from './components/UpdateModal';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

const App = () => {
    const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
    const [updateNotes, setUpdateNotes] = useState('');
    const [appVersion, setAppVersion] = useState('');
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);

    useEffect(() => {
        const checkAppVersion = async () => {
            try {
                // Obtenir la version de l'application
                let currentVersion = '1.0.0';

                if (Constants.manifest && Constants.manifest.version) {
                    // En mode développement avec Expo Go
                    currentVersion = Constants.manifest.version;
                } else if (Application.nativeApplicationVersion) {
                    // En mode production (application autonome)
                    currentVersion = Application.nativeApplicationVersion;
                }

                setAppVersion(currentVersion);

                const storedVersion = await AsyncStorage.getItem('appVersion');
                const hasLaunched = await AsyncStorage.getItem('hasLaunched');

                if (!hasLaunched) {
                    // C'est le premier lancement
                    await AsyncStorage.setItem('hasLaunched', 'true');
                    await AsyncStorage.setItem('appVersion', currentVersion);
                    setIsFirstLaunch(true);
                } else if (storedVersion !== currentVersion) {
                    // Afficher la popup de mise à jour
                    setUpdateModalVisible(true);

                    // Mettre à jour la version stockée
                    await AsyncStorage.setItem('appVersion', currentVersion);

                    // Charger les notes de mise à jour
                    const notes = await fetchUpdateNotes(currentVersion);
                    setUpdateNotes(notes);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de la version de l\'application :', error);
            }
        };

        checkAppVersion();
    }, []);

    const fetchUpdateNotes = async (version) => {
        // Remplacez ceci par votre logique pour récupérer les notes de mise à jour
        const notes = `
- **Nouvelle fonctionnalité :** Planification par créneaux horaires (matin, après-midi, soir)
- **Amélioration UI/UX :** Interface plus intuitive et agréable
- **Corrections de bugs :** Résolution de problèmes mineurs
`;
        return notes;
    };

    return (
        <Provider store={store}>
            <AppInitializer>
                <NavigationContainer>
                    <MainStackNavigator />
                </NavigationContainer>
                <UpdateModal
                    visible={isUpdateModalVisible}
                    onClose={() => setUpdateModalVisible(false)}
                    updateNotes={updateNotes}
                />
            </AppInitializer>
        </Provider>
    );
};

export default App;
