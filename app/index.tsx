import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter(); // ✅ Correct Expo Router navigation

  return (
    <View className="bg-primary-500 flex-1 justify-center items-center p-4">
      {/* Welcome Title */}
      <Text className="text-4xl font-bold text-white mb-2">Welcome!</Text>
      <Text className="text-lg text-white mb-8">Please select your role to continue</Text>

      {/* Supervisor Login Button */}
      <TouchableOpacity
        className="bg-white flex-row items-center justify-center p-4 rounded-lg w-full max-w-xs mb-4"
        onPress={() => router.push('/(auth)/SupervisorLogin')} // ✅ Fix navigation
      >
        <Ionicons name="person" size={24} color="#3b82f6" />
        <Text className="text-primary-500 text-lg font-semibold ml-2">Supervisor Login</Text>
      </TouchableOpacity>

      {/* Student Login Button */}
      <TouchableOpacity
        className="bg-white flex-row items-center justify-center p-4 rounded-lg w-full max-w-xs"
        onPress={() => router.push('/(auth)/StudentLogin')} // ✅ Fix navigation
      >
        <Ionicons name="people" size={24} color="#3b82f6" />
        <Text className="text-primary-500 text-lg font-semibold ml-2">Student Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;
