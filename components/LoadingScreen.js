import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const secrets = [
    "Les meilleures vues pour les parades se trouvent près de Main Street USA.",
    "Il y a des oreilles de Mickey cachées partout dans le parc, pouvez-vous les trouver? Il y en a plus de 43 qui ont déjà été découvertes !",
    "Les attractions les plus populaires sont souvent plus calmes pendant les parades.",
    "L'affluence à Pirate des caraïbes est plus faible en soirée.",
    "Le parc a ouvert ses portes en 1992, le 12 avril précisément.",
    "La Disney Electrical Sky Parade est un hommage à la Main Street Electrical Parade qui a opéré de 1992 à 2003 avant d'être remplacée par Disney's Fantillusion.",
    "Disneyland Paris détient le record du monde de drone volant en même temps depuis le 14 juillet 2024",
    "Avengers Campus est la dernière nouveauté du parc, ouvert en 2022",
    "Disneyland Paris a bien failli fermer ses portes, c'est Space Mountain qui a sauvé le parc, ouvert en 1995",
    "Nous vous recommandons de commencer votre visite par les Studios",
    "Disneyland Paris est plus fréquenté que la tour Eiffel !",
    "Disneyland Paris s'appelait à l'origine Euro Disney, jugé moins glamour que le nom actuel, il a donc été modifié en 1995",
    "Le dragon sous le château de la Belle au Bois Dormant est l'un des seuls audio-animatronics de ce genre dans les parcs Disney",
    "Les fenêtres des bâtiments de Main Street USA portent souvent les noms des imagineers et des personnes importantes dans l'histoire de Disney.",
    "La zone de Discoveryland est inspirée des visions futuristes de Jules Verne, H.G. Wells et Léonard de Vinci.",
    "Il existait auparavant un Pizza Planet dans le parc (1996-2016), situé à côté de Mickey’s PhilharMagic ! Il est aujourd'hui fermé.",
    "En plus du Molly Brown, le parc possède un autre bateau nommé le Mark Twain à l'abandon depuis plusieurs années, qui voguait sur le lac de Frontierland.",
    "Avant buzz l'éclair, l'attraction était nommée 'Le visionarium', une attraction sur le thème de l'avenir et des technologies.",
    "Le land de la reine des neiges a une fenêtre d'ouverture pour 2025 ! Préparez-vous à découvrir un nouveau monde !",
];

const getRandomSecret = () => {
    return secrets[Math.floor(Math.random() * secrets.length)];
};

const LoadingScreen = ({ onLoadingComplete }) => {
    const [secret, setSecret] = useState('');

    useEffect(() => {
        setSecret(getRandomSecret());
        const timer = setTimeout(() => {
            onLoadingComplete();
        }, 5000); // Simule un chargement de 5 secondes

        return () => clearTimeout(timer);
    }, [onLoadingComplete]);

    return (
        <View style={styles.loadingScreen}>
            <Text style={styles.title}>Magic Journey</Text>
            <ActivityIndicator size="large" color="#3498db" style={styles.spinner} />
            <Text style={styles.secret}>{secret}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
    title: {
        fontSize: 36,
        fontFamily: 'Brush Script MT', // Exemple de typographie personnalisée
        marginBottom: 20,
        color: '#333',
    },
    spinner: {
        marginVertical: 20,
    },
    secret: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default LoadingScreen;
