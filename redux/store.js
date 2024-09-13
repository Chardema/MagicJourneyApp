// store.js
import { configureStore } from '@reduxjs/toolkit';
import attractionsReducer from './reducer/Attractionreducer';
import favoritesReducer from './reducer/favoriteReducer';
import showsReducer from './reducer/showsReducer';

const store = configureStore({
    reducer: {
        attractions: attractionsReducer,
        favorites: favoritesReducer,
        shows: showsReducer,
    },
});

export default store;
