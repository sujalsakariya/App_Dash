// Mobile Capacitor Utilities
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';

/**
 * Check if app is running on native mobile platform
 */
export const isNativeMobile = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Get current platform (ios, android, web)
 */
export const getPlatform = () => {
  return Capacitor.getPlatform();
};

/**
 * Initialize mobile app features
 */
export const initializeMobileApp = async () => {
  if (!isNativeMobile()) {
    console.log('Running as web app');
    return;
  }

  try {
    // Hide splash screen after app is ready
    await SplashScreen.hide();

    // Configure status bar
    if (getPlatform() === 'ios' || getPlatform() === 'android') {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }

    // Listen for app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
    });

    // Listen for network status
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
    });

    // Listen for back button (Android)
    if (getPlatform() === 'android') {
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    }

    console.log('Mobile app initialized successfully');
  } catch (error) {
    console.error('Error initializing mobile app:', error);
  }
};

/**
 * Set status bar style
 */
export const setStatusBarStyle = async (isDark = false) => {
  if (!isNativeMobile()) return;
  
  try {
    await StatusBar.setStyle({ 
      style: isDark ? Style.Dark : Style.Light 
    });
  } catch (error) {
    console.error('Error setting status bar style:', error);
  }
};

/**
 * Set status bar color (Android only)
 */
export const setStatusBarColor = async (color) => {
  if (!isNativeMobile() || getPlatform() !== 'android') return;
  
  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error('Error setting status bar color:', error);
  }
};

/**
 * Show keyboard
 */
export const showKeyboard = async () => {
  if (!isNativeMobile()) return;
  
  try {
    await Keyboard.show();
  } catch (error) {
    console.error('Error showing keyboard:', error);
  }
};

/**
 * Hide keyboard
 */
export const hideKeyboard = async () => {
  if (!isNativeMobile()) return;
  
  try {
    await Keyboard.hide();
  } catch (error) {
    console.error('Error hiding keyboard:', error);
  }
};

/**
 * Get network status
 */
export const getNetworkStatus = async () => {
  try {
    const status = await Network.getStatus();
    return status;
  } catch (error) {
    console.error('Error getting network status:', error);
    return null;
  }
};

/**
 * Check if device is online
 */
export const isOnline = async () => {
  const status = await getNetworkStatus();
  return status?.connected || false;
};

/**
 * Exit app (Android only)
 */
export const exitApp = () => {
  if (isNativeMobile() && getPlatform() === 'android') {
    App.exitApp();
  }
};

export default {
  isNativeMobile,
  getPlatform,
  initializeMobileApp,
  setStatusBarStyle,
  setStatusBarColor,
  showKeyboard,
  hideKeyboard,
  getNetworkStatus,
  isOnline,
  exitApp
};
