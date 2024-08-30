// reducer/AttractionReducer.js
import { SET_ATTRACTIONS, SET_RAW_RIDE_DATA, SET_FILTERED_RIDE_DATA, SET_CLOSED_RIDE_DATA, SET_SEARCH_TERM, SET_FILTER } from "../actions/types";

const initialState = {
    rawRideData: [],
    filteredRideData: [],
    closedRideData: [],
    searchTerm: '',
    attractions: [],
    filters: {
        showShortWaitTimesOnly: false,
        hideClosedRides: false,
        selectedPark: 'all',
        selectedType: 'all',
        selectedLand: 'all',
    }
};

const attractionsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_RAW_RIDE_DATA:
            if (JSON.stringify(state.rawRideData) !== JSON.stringify(action.payload)) {
                return {
                    ...state,
                    rawRideData: action.payload,
                };
            }
            return state;

        case SET_FILTERED_RIDE_DATA:
            if (JSON.stringify(state.filteredRideData) !== JSON.stringify(action.payload)) {
                return {
                    ...state,
                    filteredRideData: action.payload,
                };
            }
            return state;

        case SET_CLOSED_RIDE_DATA:
            if (JSON.stringify(state.closedRideData) !== JSON.stringify(action.payload)) {
                return {
                    ...state,
                    closedRideData: action.payload,
                };
            }
            return state;

        case SET_SEARCH_TERM:
            if (state.searchTerm !== action.payload) {
                return {
                    ...state,
                    searchTerm: action.payload,
                };
            }
            return state;

        case SET_ATTRACTIONS:
            if (JSON.stringify(state.attractions) !== JSON.stringify(action.payload)) {
                return {
                    ...state,
                    attractions: action.payload,
                };
            }
            return state;

        case SET_FILTER:
            if (state.filters[action.payload.filter] !== action.payload.value) {
                return {
                    ...state,
                    filters: {
                        ...state.filters,
                        [action.payload.filter]: action.payload.value,
                    },
                };
            }
            return state;

        default:
            return state;
    }
};

export default attractionsReducer;

