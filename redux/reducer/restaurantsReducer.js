// restaurantsReducer.js

const initialState = {
    restaurants: [],
};

const restaurantsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_RESTAURANTS':
            return { ...state, restaurants: action.payload };
        default:
            return state;
    }
};

export default restaurantsReducer;
