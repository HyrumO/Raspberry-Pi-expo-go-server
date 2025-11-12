# Expo App

This is the Expo React Native app that runs on top of the ngrok tunnel server.

## Quick Start

### Install Dependencies

```bash
cd app
npm install
```

### Run App Independently (Without Server)

You can test the app without running the full server setup:

```bash
cd app
npx expo start
```

This will start Expo in development mode. You can:
- Scan QR code with Expo Go app
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser

### Run App with Server (Full Setup)

From the project root:

```bash
npm start
```

This will:
1. Start ngrok tunnel with basic auth
2. Generate QR code
3. Start Expo server pointing to this app directory

## Project Structure

```
app/
├── App.js           # Main app entry point
├── app.json         # Expo app configuration
├── babel.config.js  # Babel configuration
├── package.json     # App dependencies
└── assets/          # App assets (icons, images, etc.)
```

## Development

### Adding Dependencies

```bash
cd app
npm install <package-name>
```

### App Configuration

Edit `app.json` to customize:
- App name and slug
- Icons and splash screen
- Platform-specific settings
- SDK version

### Main App Code

Edit `App.js` to build your app. This is a standard React Native component.

## Assets

You'll need to add these asset files (or update `app.json` to remove references):

- `assets/icon.png` - App icon (1024x1024)
- `assets/splash.png` - Splash screen (1242x2436)
- `assets/adaptive-icon.png` - Android adaptive icon (1024x1024)
- `assets/favicon.png` - Web favicon (48x48)

For now, the app will work without these, but you'll see warnings.

## Testing

### On Physical Device

1. Install Expo Go app on your phone
2. Start the server: `npm start` (from root) or `npx expo start` (from app/)
3. Scan the QR code
4. Enter basic auth credentials if using server setup

### On Emulator/Simulator

- Android: `npx expo start --android`
- iOS: `npx expo start --ios`
- Web: `npx expo start --web`

## Notes

- The app is configured to work with Expo Go
- SDK version: 50.0.0
- React Native: 0.73.2
- React: 18.2.0

## Next Steps

1. Customize `App.js` with your app logic
2. Add screens, components, and navigation
3. Install additional dependencies as needed
4. Configure app.json for your app details

