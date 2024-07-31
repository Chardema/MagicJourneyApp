import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const BottomNav = ({ state, descriptors, navigation }) => {

    const getIcon = (routeName) => {
        switch (routeName) {
            case 'Home':
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

    // Vérification de l'existence de state et de ses routes
    if (!state || !state.routes) {
        return null; // Ou un fallback approprié
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
    },
    activeNavItem: {
        backgroundColor: '#d3d3d3',
        borderRadius: 5,
        height: 50,
        width: 70,
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
        fontSize: 20,
        marginBottom: 5,
    },
});

export default BottomNav;
