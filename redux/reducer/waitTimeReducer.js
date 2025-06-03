// waitTimesReducer.js

import { SET_WAIT_TIMES } from '../actions/actions';

const initialState = {};

const waitTimesReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_WAIT_TIMES:
            return action.payload;
        default:
            return state;
    }
};

export default waitTimesReducer;
