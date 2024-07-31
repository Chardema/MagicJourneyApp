// actions.js
import {
    SET_RAW_RIDE_DATA,
    SET_FILTERED_RIDE_DATA,
    SET_CLOSED_RIDE_DATA,
    SET_SEARCH_TERM,
    SET_ATTRACTIONS,
    SET_FAVORITES,
    TOGGLE_FAVORITE,
    TOGGLE_FAVORITE_SHOW,
} from './types';

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

export const setAttractions = (attractions) => ({
    type: SET_ATTRACTIONS,
    payload: attractions,
});

export const setFavorites = (favorites) => ({
    type: SET_FAVORITES,
    payload: favorites,
});

export const toggleFavorite = (attractionId) => ({
    type: TOGGLE_FAVORITE,
    payload: attractionId,
});


export const toggleFavoriteShow = (show) => ({
    type: TOGGLE_FAVORITE_SHOW,
    payload: show,
});
