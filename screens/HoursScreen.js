import React, {useEffect, useState} from 'react';
import {View, Text, Button, Image, StyleSheet, Dimensions, ScrollView, SafeAreaView} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import BottomNav from "../components/mobileNavbar";
import useParkHours from "../components/hooks/useParkHours";
import { formatTime, useWindowWidth } from '../components/utils';
import { useWeather, useWeatherForecast } from "../components/hooks/weather";
const Castle = require('../assets/Disneylandlogo.png');
const Studios = require('../assets/Studioslogo.png');
import {useNavigation} from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get('window');
const HoursScreen = () => {
    const parkHours = useParkHours();
    const width = useWindowWidth();
    const navigation = useNavigation();
    const weather = useWeather();
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [showWeatherInfo, setShowWeatherInfo] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const weatherForecast = useWeatherForecast(selectedDay.toISOString().split('T')[0]);
    const todayString = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxForecastDate = new Date();
    maxForecastDate.setDate(maxForecastDate.getDate() + 5);
    const isForecastAvailable = selectedDay < maxForecastDate;

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const weatherDescriptions = {
        "clear sky": "ciel clair",
        "few clouds": "quelques nuages",
        "scattered clouds": "nuages dispersés",
        "broken clouds": "nuages brisés",
        "shower rain": "pluie d'averse",
        "thunderstorm": "orage",
        "snow": "neige",
        "mist": "brume",
        "moderate rain": "pluie modérée",
        "Rain": "pluie",
        "Clouds": "nuageux",
    };

    const toggleWeatherInfo = () => {
        setShowWeatherInfo(!showWeatherInfo);
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setSelectedDay(date);
        hideDatePicker();
    };

    const isToday = (dateString) => {
        const today = new Date().toISOString().split('T')[0];
        return dateString === today;
    };

    const getSchedulesForDate = (schedules, dateString) => {
        return schedules.filter(schedule => schedule.date === dateString);
    };

    const goToToday = () => {
        setSelectedDay(new Date());
    };

    const renderScheduleInfo = (schedules, parkName, date) => {
        if (!schedules) {
            return <Text>Horaires de {parkName} non disponibles.</Text>;
        }

        const selectedDaySchedules = getSchedulesForDate(schedules, date.toISOString().split('T')[0]);
        const operatingSchedule = selectedDaySchedules.find(s => s.type === "OPERATING");
        const extraHoursSchedule = selectedDaySchedules.find(s => s.type === "EXTRA_HOURS");

        if (!operatingSchedule && !extraHoursSchedule) {
            return <Text style={styles.closedMessage}>{parkName} est actuellement fermé. Pas d'horaires disponibles pour le jour sélectionné.</Text>;
        }

        return (
            <>
                {operatingSchedule && (
                    <Text style={styles.schedule}>
                        {formatTime(new Date(operatingSchedule.openingTime))} - {formatTime(new Date(operatingSchedule.closingTime))}
                    </Text>
                )}
                {extraHoursSchedule && (
                    <Text style={styles.schedule}>
                        Extra Magic Hours: {formatTime(new Date(extraHoursSchedule.openingTime))} - {formatTime(new Date(extraHoursSchedule.closingTime))}
                    </Text>
                )}
            </>
        );
    };

    return (
        <SafeAreaView style={styles.body}>
            {width > 768 && <Navbar />}
            <ScrollView contentContainerStyle={styles.container}>
                <Button onPress={toggleWeatherInfo} title={showWeatherInfo ? 'Masquer' : 'Changer de date'} />
                {showWeatherInfo && (
                    <View style={styles.dateChangePanel}>
                        {selectedDay.toISOString().split('T')[0] !== todayString && (
                            <Button onPress={() => { goToToday(); setShowWeatherInfo(false); }} title="Aujourd'hui" />
                        )}
                        <View style={styles.datePickerContainer}>
                            <Text>Changez de date:</Text>
                            <Button onPress={showDatePicker} title="Sélectionner une date" />
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={handleConfirm}
                                onCancel={hideDatePicker}
                                minimumDate={new Date()}
                                maximumDate={maxDate}
                            />
                        </View>
                    </View>
                )}
                <View style={styles.weatherInfo}>
                    {isToday(selectedDay.toISOString().split('T')[0]) && weather && weather.main && (
                        <View>
                            <Image
                                source={{ uri: `https://openweathermap.org/img/w/${weather.weather[0].icon}.png` }}
                                style={styles.weatherIcon}
                            />
                            <Text> {Math.round(weather.main.temp)}°C </Text>
                        </View>
                    )}
                    {!isToday(selectedDay.toISOString().split('T')[0]) && isForecastAvailable && weatherForecast && weatherForecast.length > 0 ? (
                        <View>
                            <Image
                                source={{ uri: `https://openweathermap.org/img/w/${weatherForecast[0].weather[0].icon}.png` }}
                                style={styles.weatherIcon}
                            />
                            <Text>{Math.round(weatherForecast[0].main.temp)}°C</Text>
                            <Text>Prévisions : {weatherDescriptions[weatherForecast[0].weather[0].main] || weatherForecast[0].weather[0].main}</Text>
                        </View>
                    ) : (
                        !isToday(selectedDay.toISOString().split('T')[0]) && !isForecastAvailable && <Text>Les prévisions météorologiques ne sont pas encore disponibles pour cette date.</Text>
                    )}
                </View>
                <View style={styles.allParks}>
                    <View style={styles.park}>
                        <Image source={Castle} style={styles.logo} resizeMode={'contain'}/>
                        {renderScheduleInfo(parkHours?.disneyland?.schedule, "Le Parc Disneyland", selectedDay)}
                    </View>
                    <View style={styles.park}>
                        <Image source={Studios} style={styles.logo} resizeMode={'contain'} />
                        {renderScheduleInfo(parkHours?.studio?.schedule, "Les Walt Disney Studios", selectedDay)}
                    </View>
                </View>
            </ScrollView>
            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        padding: 20,
        alignItems: 'center',
    },
    dateChangePanel: {
        marginVertical: 20,
        width: '100%',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
    },
    datePickerContainer: {
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    weatherInfo: {
        marginVertical: 20,
        alignItems: 'center',
    },
    weatherIcon: {
        width: 40,
        height: 40,
    },
    allParks: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
    },
    park: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    logo: {
        width: '50%',
        maxWidth: 200,
        height: undefined,
        aspectRatio: 1,
        marginBottom: 10,
    },
    schedule: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    closedMessage: {
        fontSize: 14,
        color: '#d9534f',
        textAlign: 'center',
    },
});

export default HoursScreen;
