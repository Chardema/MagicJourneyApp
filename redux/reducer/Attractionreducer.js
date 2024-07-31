// reducer/AttractionReducer.js
import {SET_ATTRACTIONS} from "../actions/types";

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
        case 'SET_RAW_RIDE_DATA':
            return {
                ...state,
                rawRideData: action.payload,
            };
        case 'SET_FILTERED_RIDE_DATA':
            return {
                ...state,
                filteredRideData: action.payload,
            };
        case 'SET_CLOSED_RIDE_DATA':
            return {
                ...state,
                closedRideData: action.payload,
            };
        case 'SET_SEARCH_TERM':
            return {
                ...state,
                searchTerm: action.payload,
            };
        case 'SET_ATTRACTIONS':
            return {
                ...state,
                attractions: action.payload,
            };
        case 'SET_FILTER':
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [action.payload.filter]: action.payload.value,
                },
            };
        default:
            return state;
    }
};

export default attractionsReducer;
