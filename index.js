import { enableScreens } from 'react-native-screens';
import { registerRootComponent } from 'expo';
import App from './App';

// Active react-native-screens pour optimiser les performances de navigation
enableScreens();

// Register root component
registerRootComponent(App);

