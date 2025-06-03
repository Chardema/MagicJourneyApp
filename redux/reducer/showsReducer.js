import { SET_SHOWS, TOGGLE_FAVORITE_SHOW } from '../actions/types';

const initialState = {
    shows: [],  // Liste des spectacles récupérés depuis l'API
    isLoaded: false,  // Indique si les spectacles ont été récupérés depuis l'API
};

const showsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SHOWS:
            return {
                ...state,
                shows: action.payload,
                isLoaded: true,
            };

        case TOGGLE_FAVORITE_SHOW:
            const showId = action.payload;
            const isFavorite = state.shows.some(show => show._id === showId);
            if (isFavorite) {
                return {
                    ...state,
                    shows: state.shows.filter(show => show._id !== showId),
                };
            } else {
                const newShow = state.shows.find(show => show._id === showId);
                if (!newShow) {
                    console.error("Show not found:", showId);
                    return state;
                }
                return {
                    ...state,
                    shows: [...state.shows, newShow],
                };
            }

        default:
            return state;
    }
};

export default showsReducer;
