// redux/actions/initialDataActions.js
import axios from 'axios';
import { setRawRideData,setShows,setRestaurants } from "./actions";

export const fetchInitialData = () => {
    return async (dispatch) => {
        try {
            // Récupérer les attractions
            const attractionsResponse = await axios.get('https://magicjourney.fly.dev/api/attractions');
            const attractionsData = attractionsResponse.data;
            dispatch(setRawRideData(attractionsData));

            // Récupérer les spectacles
            const showsResponse = await axios.get('https://magicjourney.fly.dev/api/shows');
            const showsData = showsResponse.data;
            dispatch(setShows(showsData));

            // Récupérer les restaurants
            const restaurantsResponse = await axios.get('https://magicjourney.fly.dev/api/restaurants');
            const restaurantsData = restaurantsResponse.data;
            dispatch(setRestaurants(restaurantsData));
        } catch (error) {
            console.error('Erreur lors de la récupération des données initiales:', error);
        }
    };
};
