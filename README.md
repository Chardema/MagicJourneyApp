# MagicJourney

MagicJourney is a Disneyland Paris trip planner built with React Native and Expo. The app helps plan attraction visits, shows, and restaurants while keeping track of favorites and wait times.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables by creating a `.env` file at the project root. Example:
   ```bash
   OPEN_WEATHER_API_KEY=your_openweather_key
   ```
   The API key is used in `components/hooks/weather.js` to fetch weather data.
3. Start the development server:
   ```bash
   npm start
   ```
   This runs Expo in development mode.

## Building

Use Expo's EAS CLI to create production builds:

```bash
eas build -p android # or -p ios
```

You can also run the app locally on a device or simulator with:

```bash
npm run android
npm run ios
```

## Folder Structure

- `components/` – Reusable UI elements and hooks.
- `screens/` – Main application screens (Home, Attractions, etc.).
- `redux/` – Redux store, actions and reducers.

