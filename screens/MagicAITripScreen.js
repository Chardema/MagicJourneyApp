import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import BottomNav from "../components/mobileNavbar";
const castleImage = require('../assets/disneycastle.jpg');
import { useWindowWidth } from '../components/utils';

const MagicAITripScreen = () => {
    const width = useWindowWidth();
    return (
        <View style={styles.container}>
            {width > 768 && <Navbar />}
            <ScrollView contentContainerStyle={styles.content}>
                <Image source={castleImage} style={styles.castleImage} />
                <Text style={styles.title}>Planifiez Votre Aventure Magique à Disneyland Paris</Text>
                <Text style={styles.paragraph}>Nous travaillons actuellement sur une expérience exceptionnelle pour vous !</Text>
                <Text style={styles.paragraph}>
                    Bientôt, grâce à l'intelligence artificielle, vous pourrez personnaliser votre voyage à Disneyland Paris comme jamais auparavant.
                    Imaginez une visite parfaitement adaptée à vos goûts, vos intérêts et vos préférences.
                </Text>
                <Text style={styles.paragraph}>
                    Restez à l'écoute pour une aventure pleine de magie, d'innovation et de souvenirs inoubliables.
                </Text>
                <Text style={styles.comingSoon}>À venir bientôt !</Text>
            </ScrollView>
            <BottomNav />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    castleImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 20,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Ombre légère pour une touche de profondeur
    },
    title: {
        color: '#4a90e2',
        fontSize: 28,
        marginBottom: 20,
        textAlign: 'center',
    },
    paragraph: {
        color: '#333',
        fontSize: 18,
        lineHeight: 1.6,
        marginBottom: 20,
        textAlign: 'center',
    },
    comingSoon: {
        marginTop: 40,
        fontSize: 22,
        color: '#d35400',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default MagicAITripScreen;
