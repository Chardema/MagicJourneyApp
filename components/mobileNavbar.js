import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const BottomNav = ({ state, descriptors, navigation }) => {

    const getIcon = (routeName) => {
        switch (routeName) {
            case 'Ma journée':
                return <FontAwesome name="home" style={styles.icon} />;
            case 'Attractions':
                return <MaterialIcons name="attractions" style={styles.icon} />;
            case 'Spectacle':
                return <MaterialCommunityIcons name="star-outline" style={styles.icon} />;
            default:
                return null;
        }
    };

    if (!state || !state.routes) {
        return null;
    }

    return (
        <View style={styles.bottomNav}>
            {state.routes.map((route, index) => {
                const isActive = state.index === index;
                const navItemStyle = isActive ? [styles.navItem, styles.activeNavItem] : styles.navItem;

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={() => navigation.navigate(route.name)}
                        style={navItemStyle}
                    >
                        {getIcon(route.name)}
                        <Text style={styles.text}>{route.name}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        position: 'absolute',
        width: '100%', // Réduire la largeur pour l'effet flottant
        bottom: 20, // Mettre un espace de 20px pour donner l'effet flottant
        height: 70,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 }, // Ombre plus prononcée pour l'effet de flottement
        shadowOpacity: 0.3, // Augmenter l'opacité de l'ombre
        shadowRadius: 10,
        elevation: 10, // Renforcer l'ombre pour Android
        alignItems: 'center',
        padding: 10,
        borderRadius: 40, // Coins arrondis sur tous les côtés pour accentuer l'effet flottant
    },
    activeNavItem: {
        height: 60,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },
    text: {
        color: '#333',
        fontSize: 12,
    },
    icon: {
        fontSize: 24,
        marginBottom: 5,
    }
});


export default BottomNav;
