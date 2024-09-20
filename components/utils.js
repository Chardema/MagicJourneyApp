import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dimensions } from 'react-native';
import images from './imageAssets';
import { createSelector } from 'reselect';
import showImages from './showImagesAssets';
import restaurantImages from './RestaurantsImagesAssets';

// Définition de normalizeName avant son utilisation
export const normalizeName = (name) => {
    return name
        .normalize('NFD') // Décompose les caractères accentués
        .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
        .replace(/[^a-zA-Z0-9]/g, '') // Supprime les caractères non alphanumériques sauf lettres et chiffres
        .trim(); // Conserve les majuscules et minuscules
};

// Définition de formatImageName avant son utilisation
export const formatImageName = (name) => {
    return (
        name
            .trim()
            .replace(/®/g, '')
            .replace(/™/g, '')
            .replace(/:/g, '')
            .replace(/é/g, 'e')
            .replace(/è/g, 'e')
            .replace(/'/g, '')
            .replace(/ /g, '') // Supprime les espaces uniquement
            .replace(/[^a-zA-Z0-9]/g, '') + '.jpg' // Supprime tous les autres caractères spéciaux sauf les lettres et chiffres
    );
};

// Importation des images de spectacles
export const importShowImage = (imageName) => {
    try {
        return showImages[imageName] || showImages['default.jpg'];
    } catch (err) {
        console.error(`Erreur lors de l'importation de l'image ${imageName}:`, err);
        return showImages['default.jpg'];
    }
};

export const showNames = [
    'Stitch Live!',
    'Frozen: A Musical Invitation',
    'Disney Stars on Parade',
    'Reserved viewing area for Disney Stars on Parade',
    'Disney Illuminations',
    'Animation Academy',
    'Mickey and the Magician',
    'Disney Electrical Sky Parade',
    'Reserved viewing area for nighttime show',
    'The Lion King: Rhythms of the Pride Lands',
    'A Million Splashes of Colour',
    'Alice & the Queen of Hearts: Back to Wonderland',
    'TOGETHER: a Pixar Musical Adventure',
    'The Disney Junior Dream Factory',
    'Live Your Story - a Disney Princess Celebration',
    'Reserved viewing area:  Disney Stars on Parade',
    'Reserved viewing area:  Nighttime show',
];

// Création de la map des images de spectacles
export const showImagesMap = showNames.reduce((acc, name) => {
    const normalizedName = normalizeName(name); // Normalisation du nom
    const imageName = formatImageName(name); // Formatage du nom de l'image
    acc[normalizedName] = importShowImage(imageName);
    return acc;
}, {});

export const formatDate = (dateString) => {
    if (!dateString) return 'Date invalide';

    try {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
    } catch (error) {
        console.error('Erreur de formatage de date:', error, 'pour la date:', dateString);
        return 'Date invalide';
    }
};

export const fetchFullShowInfo = async (showId) => {
    try {
        const response = await axios.get('https://magicjourney.fly.dev/api/shows');
        const shows = response.data;
        return shows.find((show) => show.id === showId);
    } catch (error) {
        console.error('Erreur lors de la récupération des informations complètes du spectacle:', error);
        return null;
    }
};

export const useWindowWidth = () => {
    const [width, setWidth] = useState(Dimensions.get('window').width);

    useEffect(() => {
        const handleResize = ({ window }) => setWidth(window.width);

        // Utiliser la nouvelle API
        const subscription = Dimensions.addEventListener('change', handleResize);

        return () => {
            // Utiliser la méthode correcte pour enlever l'écouteur
            subscription?.remove();
        };
    }, []);

    return width;
};

export const formatTime = (dateString) => {
    if (!dateString) return 'Heure invalide';

    try {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
    } catch (error) {
        console.error('Erreur de formatage de l\'heure:', error, 'pour la date:', dateString);
        return 'Heure invalide';
    }
};

// Importation des images d'attractions
export const importImage = (imageName) => {
    try {
        return images[imageName] || images['default.jpg'];
    } catch (err) {
        console.error(`Erreur lors de l'importation de l'image ${imageName}:`, err);
        return images['default.jpg'];
    }
};

export const attractionNames = [
    'Disneyland Railroad Discoveryland Station',
    'Disneyland Railroad Fantasyland Station',
    'Disneyland Railroad Main Street Station',
    'Disneyland Railroad',
    'Orbitron®',
    'Meet Mickey Mouse',
    'Frontierland Playground',
    'Disneyland Railroad Frontierland Depot',
    'Pirate Galleon',
    'Indiana Jones™ and the Temple of Peril',
    'La Cabane des Robinson',
    'Big Thunder Mountain',
    "Mad Hatter's Tea Cups",
    'Les Voyages de Pinocchio',
    'Casey Jr. – le Petit Train du Cirque',
    'Phantom Manor',
    'Star Wars Hyperspace Mountain',
    'Star Tours: The Adventures Continue*',
    'Thunder Mesa Riverboat Landing',
    "Alice's Curious Labyrinth",
    "Buzz Lightyear Laser Blast",
    'Main Street Vehicles',
    "Peter Pan's Flight",
    'Princess Pavilion',
    'Dumbo the Flying Elephant',
    "Le Passage Enchanté d'Aladdin",
    'Autopia, presented by Avis',
    'Le Carrousel de Lancelot ',
    'Les Mystères du Nautilus',
    'La Tanière du Dragon',
    "Rustler Roundup Shootin' Gallery",
    'Adventure Isle',
    'Welcome to Starport: A Star Wars Encounter',
    "Blanche-Neige et les Sept Nains®",
    "Mickey’s PhilharMagic",
    'Pirates of the Caribbean',
    '"it\'s a small world"',
    "Le Pays des Contes de Fées, presented by Vittel",
    "Pirates' Beach",
    "Avengers Assemble: Flight Force",
    "Cars ROAD TRIP",
    "Spider-Man W.E.B. Adventure",
    "Cars Quatre Roues Rallye",
    "Toy Soldiers Parachute Drop",
    "RC Racer",
    "The Twilight Zone Tower of Terror",
    "Crush's Coaster",
    "Ratatouille: The Adventure",
    "Slinky® Dog Zigzag Spin",
    "Les Tapis Volants - Flying Carpets Over Agrabah®",
];

// Création de la map des images d'attractions
export const attractionImages = attractionNames.reduce((acc, name) => {
    const normalizedName = normalizeName(name); // Conserve les majuscules
    const imageName = formatImageName(name); // Utilise formatImageName pour correspondre aux clés de imageAssets
    acc[normalizedName] = importImage(imageName);
    return acc;
}, {});

// Liste des noms des restaurants
export const restaurantNames = [
    'Cool Post',
    'The Coffee Grinder',
    'Cookie Kitchen',
    'Restaurant Hakuna Matata',
    'Cool Station',
    'Cable Car Bake Shop',
    'Market House Deli',
    'Plaza Gardens Restaurant',
    'Victoria’s Home-Style Restaurant',
    'Walt’s – an American restaurant',
    'Pizzeria Bella Notte',
    'L\'Arbre Enchanté',
    'Auberge de Cendrillon',
    'Au Chalet de la Marionnette',
    'March Hare Refreshments',
    'Last Chance Cafe',
    'The Lucky Nugget Saloon',
    'Silver Spur Steakhouse',
    'Colonel Hathi’s Outpost Restaurant',
    'Rocket Café',
    'Critter Corral',
    'Café de la Brousse',
    'Café Hyperion',
    'Toad Hall Restaurant',
    'Cowboy Cookout Barbecue',
    'Captain Jack\'s - Restaurant des Pirates',
    'Casey’s Corner',
    'The Gibson Girl Ice Cream Parlour',
    'The Ice Cream Company',
    'The Old Mill',
    'Casa de Coco – Restaurante de Familia',
    'Agrabah Café Restaurant',
    'Character Dining at Plaza Gardens Restaurant',
    'Speciality Ice Cream',
    'Stark Factory',
    'PYM Kitchen',
    'Bistrot Chez Rémy',
    'Super Diner',
    'FAN-tastic Food Truck',
    'WEB Food Truck',
    'Toon Studio Catering Co.',
    'Ice Cream Creations',
    'Laugh’N\' Go!',
];

// Fonction pour importer les images des restaurants
export const importRestaurantImage = (imageName) => {
    try {
        return restaurantImages[imageName] || restaurantImages['default.jpg'];
    } catch (err) {
        console.error(`Erreur lors de l'importation de l'image ${imageName}:`, err);
        return restaurantImages['default.jpg'];
    }
};

// Création de la map des images des restaurants
export const restaurantImagesMap = restaurantNames.reduce((acc, name) => {
    const normalizedName = normalizeName(name); // Normalisation du nom
    const imageName = formatImageName(name); // Formatage du nom de l'image
    acc[normalizedName] = importRestaurantImage(imageName);
    return acc;
}, {});

// Sélecteurs pour les données des attractions
export const getRawRideData = (state) => state.attractions.rawRideData;
export const getSearchTerm = (state) => state.attractions.searchTerm;
export const getFilters = (state) => state.attractions.filters;

export const getFilteredRideData = createSelector(
    [getRawRideData, getSearchTerm, getFilters],
    (rawRideData, searchTerm, filters) => {
        if (!rawRideData) return [];

        const filteredData = rawRideData.filter(
            (ride) =>
                (!filters.hideClosedRides || ride.status !== 'CLOSED') &&
                (!filters.showShortWaitTimesOnly || ride.waitTime < 40) &&
                (filters.selectedPark === 'all' || ride.parkId === filters.selectedPark) &&
                (filters.selectedType === 'all' || ride.type === filters.selectedType) &&
                (filters.selectedLand === 'all' || ride.land === filters.selectedLand) &&
                ride.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filteredData.sort((a, b) => a.waitTime - b.waitTime);
    }
);
