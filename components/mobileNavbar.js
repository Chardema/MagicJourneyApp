import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const BottomNav = ({ state, descriptors, navigation }) => {

    const getIcon = (routeName) => {
        switch (routeName) {
            case 'Ma journée':
                return <FontAwesome name="home" style={styles.icon} />;
            case 'Hours':
                return <MaterialIcons name="schedule" style={styles.icon} />;
            case 'Attractions':
                return <MaterialIcons name="attractions" style={styles.icon} />;
            case 'Spectacle':
                return <MaterialCommunityIcons name="star-outline" style={styles.icon} />;
            case 'MagicAITrip':
                return <FontAwesome name="magic" style={styles.icon} />;
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
        width: '100%',
        bottom: 0,
        height: 80,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'center',
        padding: 10,
        borderTopLeftRadius: 25, // Coins arrondis pour la barre inférieure
        borderTopRightRadius: 25,
    },
    activeNavItem: {
        height: 60,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', // Nécessaire pour le positionnement absolu des oreilles
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
    },
    earsContainer: {
        position: 'absolute',
        top: -10, // Positionnement des oreilles
        left: '50%',
        width: 60,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        transform: [{ translateX: -30 }], // Centrer les oreilles
    },
    earLeft: {
        width: 20,
        height: 20,
        backgroundColor: '#fff', // Même couleur que la navbar
        borderTopLeftRadius: 20, // Bord supérieur gauche arrondi
        borderTopRightRadius: 20, // Bord supérieur droit arrondi
        borderWidth: 1,
        borderColor: '#d3d3d3',
        position: 'absolute',
        left: -10, // Positionner à gauche de l'onglet actif
        top: -10, // Ajuster pour qu'elle soit attachée à la navbar
    },
    earRight: {
        width: 20,
        height: 20,
        backgroundColor: '#fff', // Même couleur que la navbar
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
        borderColor: '#d3d3d3',
        position: 'absolute',
        right: -10, // Positionner à droite de l'onglet actif
        top: -10, // Ajuster pour qu'elle soit attachée à la navbar
    },
});

export default BottomNav;
