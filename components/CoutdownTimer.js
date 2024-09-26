// CountdownTimer.js
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

const CountdownTimer = ({ startDate }) => {
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            // Calculer la différence en millisecondes
            let diff = startDate - now;

            // Inclure le premier jour en ajoutant un jour (en millisecondes)
            diff += 24 * 60 * 60 * 1000;

            if (diff <= 0) {
                // Le compte à rebours a atteint zéro
                setTimeRemaining(0);
                clearInterval(interval);
            } else {
                // Mettre à jour le temps restant
                setTimeRemaining(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startDate]);

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <View>
            {timeRemaining > 0 ? (
                <Text>Temps restant : {formatTime(timeRemaining)}</Text>
            ) : (
                <Text>Bon séjour !</Text>
            )}
        </View>
    );
};

export default CountdownTimer;
