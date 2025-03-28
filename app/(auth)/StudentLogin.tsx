import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ScrollView, Alert, ActivityIndicator, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';

const StudentLoginScreen = () => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { error, loading, request } = useApi();
  const { saveToken } = useGetToken();

  const handleLogin = async () => {
    if (!loginInput || !password) {
      Alert.alert('Login Failed', 'Please enter your credentials.');
      return;
    }
  
    console.log("Sending request with payload:", { email: loginInput, password });
    
    try {
      const response = await request('/auth/student/login', 'POST', {
        email: loginInput.trim(),
        password: password.trim(),
      });
    
      console.log("Request completed. Response:", response);
      
      if (response?.token) {
        console.log('Login Successful:', response);
        await saveToken(response.token);
        console.log('Token saved:', response.token);
        router.replace('/student/(tabs)/');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials or server error.');
      }
    } catch (err) {
      console.error("Login Error:", err.message || error);
      Alert.alert('Login Failed', err.message || error || 'An error occurred during login.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Updated background color to a light blue/gray */}
        <View className="flex-1 justify-center p-4 bg-[#874147]">
          {/* Login Container */}
          <View className="bg-white p-6 rounded-lg shadow-md">
            {/* University Logo and Header */}
            <View className="flex justify-center items-center mb-6">
              {/* Replace with your actual logo path */}
              <Image 
                source={require('@/assets/images/msus.png')} 
                className="w-40 h-40 mb-4"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-[#1b583c] mb-1">MANICALAND STATE UNIVERSITY</Text>
              <Text className="text-lg font-semibold text-[#1b583c] mb-4">APPLIED SCIENCES</Text>
              <Text className="text-xl font-bold text-[#1b583c] mb-2">Welcome!</Text>
              <Text className="text-lg text-[#003366]">Student Login</Text>
            </View>

            {/* Email Input */}
            <Text className="text-lg font-semibold mb-2 text-[#1b583c]">Email</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-lg mb-4 text-gray-700"
              placeholder="Enter ID, Email, or Phone"
              placeholderTextColor="gray"
              value={loginInput}
              onChangeText={setLoginInput}
              keyboardType="default"
              autoCapitalize="none"
            />

            {/* Password Input */}
            <Text className="text-lg font-semibold mb-2 text-[#1b583c]">Password</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-lg mb-4 text-gray-700"
              placeholder="Enter your password"
              placeholderTextColor="gray"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Login Button - Updated to blue */}
            <TouchableOpacity
              className="bg-[#1b583c] p-3 rounded-lg flex-row justify-center items-center"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="white" />
                  <Text className="text-white text-lg font-semibold ml-2">Login</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StudentLoginScreen;