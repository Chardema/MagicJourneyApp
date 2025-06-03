// AppInitializer.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import { fetchInitialData} from "../redux/actions/initialDataActions";

const AppInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const dataLoaded = useSelector((state) => {
        return (
            state.attractions.isLoaded &&
            state.shows.isLoaded &&
            state.restaurants.isLoaded
        );
    });

    useEffect(() => {
        dispatch(fetchInitialData());
    }, [dispatch]);

    if (!dataLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return children;
};

export default AppInitializer;
