module.exports = function (config) {
    return {
        ...config,
        plugins: [
            ...config.plugins,
            [
                'expo-dev-client',
                {
                    host: 'localhost', // Utilise l'adresse IP de ton ordinateur si nécessaire
                },
            ],
        ],
    };
};