// MagicAITripScreen.js

import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import BottomNav from '../components/mobileNavbar';
const castleImage = require('../assets/disneycastle.jpg');
import { useWindowWidth } from '../components/utils';

const MagicAITripScreen = () => {
    const width = useWindowWidth();
    const windowHeight = Dimensions.get('window').height;

    return (
        <View style={styles.container}>
            {/* {width > 768 && <Navbar />} */}
            <ScrollView contentContainerStyle={[styles.content, { minHeight: windowHeight }]}>
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
                <LottieView
                    source={require('../assets/fairy_dust.json')}
                    autoPlay
                    loop
                    style={styles.animation}
                />
            </ScrollView>
            <BottomNav />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Fond noir pour un effet nocturne
    },
    content: {
        padding: 20,
        alignItems: 'center',
        position: 'relative',
    },
    castleImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
        marginBottom: 20,
        // Ombre légère pour une touche de profondeur
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: {
        color: '#FFD700', // Or pour un effet magique
        fontSize: 28,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    paragraph: {
        color: '#FFFFFF',
        fontSize: 18,
        lineHeight: 26,
        marginBottom: 20,
        textAlign: 'center',
    },
    comingSoon: {
        marginTop: 40,
        fontSize: 22,
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    animation: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
});

export default MagicAITripScreen;
