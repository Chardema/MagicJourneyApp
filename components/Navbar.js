import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.navbar}>
            <View style={styles.navLinks}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.link}>Accueil</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Hours')}>
                    <Text style={styles.link}>Horaires</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Attractions')}>
                    <Text style={styles.link}>Attractions</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Spectacle')}>
                    <Text style={styles.link}>Spectacle</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('MagicAITrip')}>
                    <Text style={styles.link}>MagicAITrip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: '#F0F0F0',
    },
    navLinks: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    link: {
        textDecorationLine: 'none',
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'Nunito', // Assurez-vous d'avoir installé la police ou d'utiliser une alternative.
        paddingHorizontal: 20,
    },
});

export default Navbar;
