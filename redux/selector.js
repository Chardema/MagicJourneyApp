// redux/selectors.js

import { createSelector } from 'reselect';

// Sélecteurs de base
export const getRawRideData = (state) => state.attractions.rawRideData;
export const getSearchTerm = (state) => state.attractions.searchTerm;
export const getFilters = (state) => state.attractions.filters;

// Sélecteur pour obtenir les données filtrées
export const getFilteredRideData = createSelector(
    [getRawRideData, getSearchTerm, getFilters],
    (rawRideData, searchTerm, filters) => {
        if (!rawRideData) return [];

        const filteredData = rawRideData.filter(
            (ride) =>
                (!filters.hideClosedRides || ride.status !== 'CLOSED') &&
                (!filters.showShortWaitTimesOnly || (ride.waitTime && ride.waitTime < 40)) &&
                (filters.selectedPark === 'all' || ride.parkId === filters.selectedPark) &&
                (filters.selectedType === 'all' || ride.type === filters.selectedType) &&
                (filters.selectedLand === 'all' || ride.land === filters.selectedLand) &&
                ride.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filteredData.sort((a, b) => a.waitTime - b.waitTime);
    }
);

// Sélecteur pour obtenir les catégories (par exemple, les "lands")
export const getCategories = createSelector(
    [getRawRideData],
    (rawRideData) => {
        const lands = [...new Set(rawRideData.map((ride) => ride.land))];
        return lands;
    }
);
