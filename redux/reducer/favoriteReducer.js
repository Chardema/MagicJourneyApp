// reducer/favoriteReducer.js
import { SET_FAVORITES, TOGGLE_FAVORITE, TOGGLE_FAVORITE_SHOW, SET_ATTRACTIONS } from '../actions/types';

const initialState = {
    favorites: [],
    attractions: [],
    shows: [],
};

const favoritesReducer = (state = initialState, action) => {
    console.log('Action Received:', action);
    switch (action.type) {
        case SET_ATTRACTIONS:
            return {
                ...state,
                attractions: action.payload,
            };
        case TOGGLE_FAVORITE:
            const attractionId = action.payload;
            const isAlreadyFavorite = state.favorites.some(fav => fav._id === attractionId);
            if (isAlreadyFavorite) {
                return {
                    ...state,
                    favorites: state.favorites.filter(fav => fav._id !== attractionId),
                };
            } else {
                const newFavorite = state.attractions.find(attr => attr._id === attractionId);
                if (!newFavorite) {
                    console.error("Attraction not found:", attractionId);
                    return state;
                }
                return {
                    ...state,
                    favorites: [...new Set([...state.favorites, newFavorite])], // Utilisation de Set pour éviter les doublons
                };
            }

        case TOGGLE_FAVORITE_SHOW:
            const showId = action.payload;
            const showExists = state.favorites.some(fav => fav._id === showId);
            if (showExists) {
                return {
                    ...state,
                    favorites: state.favorites.filter(fav => fav._id !== showId),
                };
            } else {
                return {
                    ...state,
                    favorites: [...state.favorites, { _id: showId }],
                };
            }
        case SET_FAVORITES:
            return {
                ...state,
                favorites: action.payload,
            };
        default:
            return state;
    }
};

export default favoritesReducer;
