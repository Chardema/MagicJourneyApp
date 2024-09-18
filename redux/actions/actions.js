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


export const toggleFavoriteShow = (show) => ({
    type: TOGGLE_FAVORITE_SHOW,
    payload: show,
});
