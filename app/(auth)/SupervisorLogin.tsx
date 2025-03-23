import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi'; // Adjust path based on your project structure
import useGetToken from '@/hooks/useGetToken'; // Import the useGetToken hook

const SupervisorLoginScreen = () => {
  const [loginInput, setLoginInput] = useState(''); // Email
  const [password, setPassword] = useState('');
  
  const router = useRouter();
  const { error, loading, request } = useApi();
  const { saveToken } = useGetToken(); // Use the saveToken function from useGetToken

  const handleLogin = async () => {
    if (!loginInput || !password) {
      Alert.alert('Login Failed', 'Please enter your credentials.');
      return;
    }
  
    console.log("Sending supervisor login request with payload:", { email: loginInput, password });
    
    try {
      // Capture the response directly from the request
      const response = await request('/auth/supervisor/login', 'POST', {
        email: loginInput.trim(),
        password: password.trim(),
      });
    
      console.log("Request completed. Response:", response);
      
      if (response?.token) {
        console.log('Supervisor Login Successful:', response);
        await saveToken(response.token); // Save the token to AsyncStorage
        console.log('Token saved:', response.token);
        router.replace('/supervisor/(tabs)/');
      } else {
        // If we got a response but no token
        Alert.alert('Login Failed', 'Invalid credentials or server error.');
      }
    } catch (err) {
      // This will catch any errors that weren't handled by useApi
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
        <View className="flex-1 justify-center p-4 bg-primary-500">
          {/* Login Container */}
          <View className="bg-white p-6 rounded-lg">
            <View className="flex justify-center items-center">
              <Text className="text-4xl font-bold text-black mb-2">Welcome!</Text>
              <Text className="text-lg mb-8 text-black">Supervisor Login</Text>
            </View>

            {/* Email Input */}
            <Text className="text-lg font-semibold mb-2 text-primary-500">Email</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-lg mb-4 text-gray-700"
              placeholder="Enter your email"
              placeholderTextColor="gray"
              value={loginInput}
              onChangeText={setLoginInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password Input */}
            <Text className="text-lg font-semibold mb-2 text-primary-500">Password</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-lg mb-4 text-gray-700"
              placeholder="Enter your password"
              placeholderTextColor="gray"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Login Button */}
            <TouchableOpacity
              className="bg-primary-500 p-3 rounded-lg flex-row justify-center items-center"
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

export default SupervisorLoginScreen;