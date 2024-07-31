// components/CardSwipe.js
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { PanResponder } from 'react-native';

const CardSwipe = ({ attraction, onSwipeLeft, onSwipeRight }) => {
    const [swipeDirection, setSwipeDirection] = useState('');
    const pan = useState(new Animated.ValueXY())[0];

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const direction = gestureState.dx > 0 ? 'Right' : 'Left';
            setSwipeDirection(direction);
            Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gestureState);
        },
        onPanResponderRelease: (evt, gestureState) => {
            if (gestureState.dx > 120) {
                Animated.spring(pan, { toValue: { x: 200, y: gestureState.dy }, useNativeDriver: false }).start(() => {
                    onSwipeRight(attraction);
                });
            } else if (gestureState.dx < -120) {
                Animated.spring(pan, { toValue: { x: -200, y: gestureState.dy }, useNativeDriver: false }).start(() => {
                    onSwipeLeft(attraction);
                });
            } else {
                Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
            }
            setSwipeDirection('');
        },
    });

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                styles.card,
                {
                    transform: [
                        ...pan.getTranslateTransform(),
                        { rotate: pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-10deg', '0deg', '10deg'] }) },
                    ],
                },
            ]}
        >
            <Image source={{ uri: attraction.image }} style={styles.image} />
            <View style={styles.details}>
                <Text style={styles.title}>{attraction.name}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '90%',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    details: {
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CardSwipe;
