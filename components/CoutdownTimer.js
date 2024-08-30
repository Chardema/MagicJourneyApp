import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CountdownTimer = ({ targetDate }) => {
    const [countdown, setCountdown] = useState(targetDate - new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCountdown(targetDate - new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, [targetDate]);

    const formatCountdown = (ms) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);

        return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    };

    if (countdown <= 0) {
        return <Text>Le compte à rebours est terminé !</Text>;
    }

    return (
        <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{formatCountdown(countdown)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    countdownContainer: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    countdownText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
});

export default React.memo(CountdownTimer);
