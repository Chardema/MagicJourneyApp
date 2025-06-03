// actions.js
import {
    SET_RAW_RIDE_DATA,
    SET_FILTERED_RIDE_DATA,
    SET_CLOSED_RIDE_DATA,
    SET_SEARCH_TERM,
    SET_ATTRACTIONS,
    SET_FAVORITES,
    TOGGLE_FAVORITE,
    TOGGLE_FAVORITE_SHOW, SET_SHOWS,
} from './types';
import axios from "axios";

export const setRawRideData = (data) => ({
    type: SET_RAW_RIDE_DATA,
    payload: data,
});

export const setFilteredRideData = (data) => ({
    type: SET_FILTERED_RIDE_DATA,
    payload: data,
});

export const setClosedRideData = (data) => ({
    type: SET_CLOSED_RIDE_DATA,
    payload: data,
});

export const setSearchTerm = (term) => ({
    type: SET_SEARCH_TERM,
    payload: term,
});

export const setAttractions = () => async (dispatch) => {
    try {
        const response = await axios.get('https://magicjourney.fly.dev/api/attractions');
        dispatch({
            type: SET_ATTRACTIONS,
            payload: response.data,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des attractions :', error);
    }
};

export const setFavorites = (favorites) => ({
    type: SET_FAVORITES,
    payload: favorites,
});

export const toggleFavorite = (attractionId) => ({
    type: TOGGLE_FAVORITE,
    payload: attractionId,
});
// Action pour récupérer les spectacles depuis l'API
export const setShows = () => async dispatch => {
    try {
        const response = await axios.get('https://magicjourney.fly.dev/api/shows');
        dispatch({
            type: SET_SHOWS,
            payload: response.data,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des spectacles :', error);
    }
};
// actions.js

export const setRestaurants = () => {
    return async (dispatch) => {
        try {
            const response = await fetch('https://magicjourney.fly.dev/api/restaurants');
            const data = await response.json();
            dispatch({ type: 'SET_RESTAURANTS', payload: data });
        } catch (error) {
            console.error('Erreur lors du chargement des restaurants:', error);
        }
    };
};



export const toggleFavoriteShow = (show) => ({
    type: TOGGLE_FAVORITE_SHOW,
    payload: show,
});

// actions.js

export const SET_WAIT_TIMES = 'SET_WAIT_TIMES';

export const setWaitTimes = () => {
    return async (dispatch) => {
        try {
            const response = await fetch('https://magicjourney.fly.dev/api/attractions');
            const data = await response.json();

            // Convertir la liste des temps d'attente en un objet avec les IDs des attractions comme clés
            const waitTimesMap = {};
            data.forEach((attraction) => {
                waitTimesMap[attraction._id] = attraction.waitTime;
            });

            dispatch({
                type: SET_WAIT_TIMES,
                payload: waitTimesMap,
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des temps d\'attente :', error);
        }
    };
};

