// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
        assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
        sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    },
};

// Fusionner la configuration par défaut avec les personnalisations
module.exports = {
    ...defaultConfig,
    transformer: {
        ...defaultConfig.transformer,
        ...customConfig.transformer,
    },
    resolver: {
        ...defaultConfig.resolver,
        ...customConfig.resolver,
    },
};
