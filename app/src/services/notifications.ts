import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_STORAGE_KEY = '@notification_enabled';
const NOTIFICATION_TIME_KEY = '@notification_time';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<void> {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Study! 📚',
        body: 'Don\'t forget to review your Arabic flashcards today!',
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });

    // Save notification settings
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
    await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, JSON.stringify({ hour, minute }));
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, 'false');
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

export async function isNotificationEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
}

export async function getNotificationTime(): Promise<{ hour: number; minute: number } | null> {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    return null;
  }
}

