// utils/attractionAvailability.js

export function isAttractionAvailable(attraction, tripDates) {
    if (!attraction.rehab) {
        // L'attraction n'est pas en réhabilitation, donc elle est disponible
        return true;
    }

    if (!attraction.rehabStartDate || !attraction.rehabEndDate) {
        // Les dates de réhabilitation ne sont pas définies correctement
        return false;
    }

    const rehabStart = new Date(attraction.rehabStartDate);
    const rehabEnd = new Date(attraction.rehabEndDate);

    // Vérifier si au moins une date du séjour n'est pas dans la période de réhabilitation
    return tripDates.some((date) => date < rehabStart || date > rehabEnd);
}

export function getAvailableDatesForAttraction(attraction, tripDates) {
    if (!attraction.rehab) {
        // L'attraction n'est pas en réhabilitation, donc elle est disponible tous les jours
        return tripDates;
    }

    if (!attraction.rehabStartDate || !attraction.rehabEndDate) {
        // Les dates de réhabilitation ne sont pas définies correctement
        return [];
    }

    const rehabStart = new Date(attraction.rehabStartDate);
    const rehabEnd = new Date(attraction.rehabEndDate);

    // Retourner les dates du séjour qui ne sont pas dans la période de réhabilitation
    return tripDates.filter((date) => date < rehabStart || date > rehabEnd);
}
