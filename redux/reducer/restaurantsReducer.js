// redux/reducer/restaurantsReducer.js
import { SET_RESTAURANTS } from '../actions/types';

const initialState = {
    restaurants: [],
    isLoaded: false,
};

const restaurantsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_RESTAURANTS:
            return {
                ...state,
                restaurants: action.payload,
                isLoaded: true,
            };
        // Ajoutez le cas default qui retourne l'état actuel
        default:
            return state;
    }
};

export default restaurantsReducer;
