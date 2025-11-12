import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from '../components/ThemeToggle';
import { exportBackup, importBackup } from '../services/storage';
import { pickAnkiFile } from '../services/ankiParser';

export default function SettingsScreen() {
  const { isDark } = useTheme();

  const handleExport = async () => {
    try {
      const fileUri = await exportBackup();
      if (fileUri) {
        Alert.alert('Success', `Backup exported to: ${fileUri}`);
      } else {
        Alert.alert('Error', 'Failed to export backup.');
      }
    } catch (error) {
      console.error('Error exporting backup:', error);
      Alert.alert('Error', 'An error occurred while exporting backup.');
    }
  };

  const handleImport = async () => {
    try {
      const fileUri = await pickAnkiFile();
      if (!fileUri) {
        return;
      }

      const success = await importBackup(fileUri);
      if (success) {
        Alert.alert('Success', 'Backup imported successfully!');
      } else {
        Alert.alert('Error', 'Failed to import backup.');
      }
    } catch (error) {
      console.error('Error importing backup:', error);
      Alert.alert('Error', 'An error occurred while importing backup.');
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <ScrollView className="flex-1 p-4">
        <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
          Settings
        </Text>
        
        <View className="mb-4">
          <ThemeToggle />
        </View>

        <View className="mb-4">
          <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Data Management
          </Text>
          
          <TouchableOpacity
            onPress={handleExport}
            className={`p-4 rounded-lg mb-2 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
          >
            <Text className={isDark ? 'text-text-dark' : 'text-text-light'}>
              Export Backup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleImport}
            className={`p-4 rounded-lg ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
          >
            <Text className={isDark ? 'text-text-dark' : 'text-text-light'}>
              Import Backup
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

