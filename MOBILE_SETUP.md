# Mobile App Setup Guide

Your web application has been successfully converted to a mobile app for iOS and Android using Capacitor!

## 📱 What's Been Set Up

- ✅ Capacitor core and CLI installed
- ✅ Android platform added (`android/` folder)
- ✅ iOS platform added (`ios/` folder)
- ✅ Vite configuration updated for mobile builds
- ✅ Essential mobile plugins installed (SplashScreen, StatusBar, App, Keyboard, Network)
- ✅ Mobile build scripts added to `package.json`

## 🚀 Development Workflow

### Build and Sync
```bash
npm run mobile:sync
```
This command:
1. Builds your web app (`npm run build`)
2. Copies the build to mobile platforms (`npx cap sync`)
3. Updates native dependencies

### Open in Native IDEs

**Android (Android Studio):**
```bash
npm run mobile:android
```

**iOS (Xcode - Mac only):**
```bash
npm run mobile:ios
```

### Run on Device/Emulator

**Android:**
```bash
npm run mobile:run:android
```

**iOS (Mac only):**
```bash
npm run mobile:run:ios
```

## 📋 Prerequisites

### For Android Development:
- [Android Studio](https://developer.android.com/studio) installed
- Android SDK configured
- Java Development Kit (JDK) 17 or higher

### For iOS Development:
- macOS computer (iOS development requires Mac)
- [Xcode](https://developer.apple.com/xcode/) 14 or higher installed
- iOS Simulator or physical iOS device
- Apple Developer account (for device testing and App Store)

## 🔧 Configuration Files

- `capacitor.config.json` - Main Capacitor configuration
- `android/` - Android native project (open in Android Studio)
- `ios/` - iOS native project (open in Xcode)

## 🎨 Customizing Your App

### App Icons and Splash Screens
1. Place your app icon at `resources/icon.png` (1024x1024px)
2. Place your splash screen at `resources/splash.png` (2732x2732px)
3. Install Capacitor Assets plugin:
   ```bash
   npm install @capacitor/assets --save-dev
   npx capacitor-assets generate
   ```

### App Name and Bundle ID
Edit `capacitor.config.json`:
```json
{
  "appId": "com.dashboard.app",
  "appName": "Dashboard App"
}
```

### App Permissions
- **Android**: Edit `android/app/src/main/AndroidManifest.xml`
- **iOS**: Edit `ios/App/App/Info.plist`

## 📦 Installed Capacitor Plugins

- **@capacitor/splash-screen** - Native splash screen
- **@capacitor/status-bar** - Status bar customization
- **@capacitor/app** - App lifecycle and deep linking
- **@capacitor/keyboard** - Keyboard behavior control
- **@capacitor/network** - Network status monitoring

## 🔄 Update Native Projects

After installing new Capacitor plugins or updating dependencies:
```bash
npm run mobile:sync
```

## 🐛 Common Issues

### Android Build Fails
- Ensure Android Studio is installed
- Check Java version: `java -version` (need JDK 17+)
- Sync Gradle in Android Studio

### iOS Build Fails (Mac only)
- Ensure Xcode is installed
- Run `sudo xcode-select --switch /Applications/Xcode.app`
- Install CocoaPods: `sudo gem install cocoapods`
- Run `cd ios/App && pod install`

### App Shows Blank Screen
- Check browser console in native IDE
- Ensure `base: './'` is set in `vite.config.js`
- Verify build was created: check `dist/` folder

## 📚 Useful Commands

```bash
# Check Capacitor installation
npx cap doctor

# List installed platforms
npx cap ls

# Copy web assets to native platforms
npx cap copy

# Update native platforms and plugins
npx cap sync

# Remove a platform
npx cap remove android
npx cap remove ios
```

## 🌐 Testing in Browser
Your app still works as a web app:
```bash
npm run dev
```

## 📱 Publishing

### Android (Google Play Store)
1. Generate signed APK/AAB in Android Studio
2. Create Google Play Console account
3. Upload and publish

### iOS (Apple App Store)
1. Archive app in Xcode
2. Submit through App Store Connect
3. Apple Developer account required ($99/year)

## 🔗 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Android Developer Guide](https://developer.android.com/)
- [iOS Developer Guide](https://developer.apple.com/)

---

**Note**: iOS development requires macOS. If you're on Windows, you can only build and test Android apps locally. For iOS, you'll need a Mac or cloud service like MacStadium or Codemagic.
