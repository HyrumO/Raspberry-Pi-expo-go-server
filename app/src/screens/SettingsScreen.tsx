import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center mb-6 mt-2">
          <Ionicons name="settings" size={24} color="#14b8a6" />
          <Text className={`ml-2 text-2xl font-bold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Settings
          </Text>
        </View>
        
        <View className="mb-6">
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Appearance
          </Text>
          <ThemeToggle />
        </View>

        <View className="mb-4">
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
            Data Management
          </Text>
          
          <TouchableOpacity
            onPress={handleExport}
            className={`p-4 rounded-xl mb-3 flex-row items-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.1 : 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Ionicons name="download-outline" size={24} color="#14b8a6" />
            <View className="ml-3 flex-1">
              <Text className={`font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                Export Backup
              </Text>
              <Text className={`text-sm mt-1 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                Save your data to a file
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleImport}
            className={`p-4 rounded-xl flex-row items-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.1 : 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Ionicons name="cloud-upload-outline" size={24} color="#14b8a6" />
            <View className="ml-3 flex-1">
              <Text className={`font-semibold ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                Import Backup
              </Text>
              <Text className={`text-sm mt-1 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                Restore data from a backup file
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

