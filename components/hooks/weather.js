// hooks/useWeather.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = "e58d393ecefe611db214805b39c74a9c";
const LATITUDE = 48.8719;  // Latitude de Disneyland Paris
const LONGITUDE = 2.7769;  // Longitude de Disneyland Paris

const useWeather = () => {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}&units=metric`;
            try {
                const response = await axios.get(url);
                if (response.data && response.data.main && response.data.weather) {
                    setWeather(response.data);
                } else {
                    console.error("Réponse de l'API incomplète pour la météo actuelle");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la météo", error);
            }
        };

        fetchWeather();
    }, []);

    return weather;
};

const useWeatherForecast = (selectedDay) => {
    const [weatherForecast, setWeatherForecast] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}&units=metric`);
                if (response.data && response.data.list) {
                    const forecasts = response.data.list;
                    const formattedSelectedDay = new Date(selectedDay).toISOString().split('T')[0];

                    const forecastsForSelectedDay = forecasts.filter(forecast =>
                        new Date(forecast.dt * 1000).toISOString().split('T')[0] === formattedSelectedDay
                    );

                    if (forecastsForSelectedDay.length > 0) {
                        setWeatherForecast(forecastsForSelectedDay);
                    } else {
                        console.error("Aucune prévision trouvée pour le jour sélectionné");
                    }
                } else {
                    console.error("Réponse de l'API incomplète pour les prévisions météorologiques");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des prévisions météorologiques :", error);
            }
        })();
    }, [selectedDay]);

    return weatherForecast;
}

export { useWeather, useWeatherForecast };
