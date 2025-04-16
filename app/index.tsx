import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View className="bg-white flex-1 justify-center items-center p-4">
      {/* University Logo and Header */}
      <View className="flex justify-center items-center mb-12">
        <Image 
          source={require('@/assets/images/msus.png')} 
          className="w-40 h-40 mb-4"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-[#1b583c] mb-1">MANICALAND STATE UNIVERSITY</Text>
        <Text className="text-lg font-semibold text-[#1b583c] mb-4">APPLIED SCIENCES</Text>
      </View>

      {/* Welcome Title */}
      <Text className="text-3xl font-bold text-[#1b583c] mb-2">Welcome!</Text>
      <Text className="text-lg text-[#1b583c] mb-8">Please select your role to continue</Text>

      {/* Supervisor Login Button */}
      <TouchableOpacity
        className="bg-[#1b583c] flex-row items-center justify-center p-4 rounded-lg w-full max-w-xs mb-4"
        onPress={() => router.push('/(auth)/SupervisorLogin')}
      >
        <Ionicons name="person" size={24} color="white" />
        <Text className="text-white text-lg font-semibold ml-2">Supervisor Login</Text>
      </TouchableOpacity>

      {/* Coordinator Login Button */}
      <TouchableOpacity
        className="bg-[#874147] flex-row items-center justify-center p-4 rounded-lg w-full max-w-xs mb-4"
        onPress={() => router.push('/(auth)/CordinatorLogin')}
      >
        <Ionicons name="briefcase" size={24} color="white" />
        <Text className="text-white text-lg font-semibold ml-2">Coordinator Login</Text>
      </TouchableOpacity>

      {/* Student Login Button */}
      <TouchableOpacity
        className="bg-[#1b583c] flex-row items-center justify-center p-4 rounded-lg w-full max-w-xs"
        onPress={() => router.push('/(auth)/StudentLogin')}
      >
        <Ionicons name="people" size={24} color="white" />
        <Text className="text-white text-lg font-semibold ml-2">Student Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;