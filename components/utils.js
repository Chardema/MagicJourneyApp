import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dimensions } from 'react-native';
import images from "./imageAssets";

export const formatDate = (dateString) => {
    if (!dateString) return 'Date invalide';

    try {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
    } catch (error) {
        console.error("Erreur de formatage de date:", error, "pour la date:", dateString);
        return 'Date invalide';
    }
};

export const fetchFullShowInfo = async (showId) => {
    try {
        const response = await axios.get('https://eurojourney.azurewebsites.net/api/shows');
        const shows = response.data;
        const specificShow = shows.find(show => show.id === showId);
        return specificShow;
    } catch (error) {
        console.error('Erreur lors de la récupération des informations complètes du spectacle:', error);
        return null;
    }
};

export const useWindowWidth = () => {
    const [width, setWidth] = useState(Dimensions.get('window').width);

    useEffect(() => {
        const handleResize = () => setWidth(Dimensions.get('window').width);
        Dimensions.addEventListener('change', handleResize);

        return () => Dimensions.removeEventListener('change', handleResize);
    }, []);

    return width;
};

export const formatImageName = (name) => {
    return name
            .replace(/®/g, '')
            .replace(/™/g, '')
            .replace(/:/g, '')
            .replace(/é/g, 'e')
            .replace(/è/g, 'e')
            .replace(/'/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
        + '.jpg';
};

export const formatTime = (dateString) => {
    if (!dateString) return 'Heure invalide';

    try {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
    } catch (error) {
        console.error("Erreur de formatage de l'heure:", error, "pour la date:", dateString);
        return 'Heure invalide';
    }
};

export const importImage = (imageName) => {
    try {
        return images[imageName] || images['default.jpg'];
    } catch (err) {
        console.error(`Erreur lors de l'importation de l'image ${imageName}:`, err);
        return images['default.jpg'];
    }
};
