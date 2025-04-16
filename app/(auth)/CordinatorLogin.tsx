import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ScrollView, Alert, ActivityIndicator, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';

const CoordinatorLogin = () => {
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
  
    console.log("Sending coordinator login request with payload:", { email: loginInput, password });
    
    try {
      const response = await request('/auth/coordinator/login', 'POST', {
        email: loginInput.trim(),
        password: password.trim(),
      });
    
      console.log("Coordinator login response:", response);
      
      if (response?.token) {
        console.log('Coordinator Login Successful:', response);
        await saveToken(response.token);
        console.log('Token saved:', response.token);
        router.replace('/cordinator/(tabs)/');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials or server error.');
      }
    } catch (err) {
      console.error("Coordinator Login Error:", err.message || error);
      Alert.alert('Login Failed', err.message || error || 'An error occurred during login.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Background color changed to distinguish from student login */}
        <View className="flex-1 justify-center p-4 bg-[#1b583c]">
          {/* Login Container */}
          <View className="bg-white p-6 rounded-lg shadow-md">
            {/* University Logo and Header */}
            <View className="flex justify-center items-center mb-6">
              <Image 
                source={require('@/assets/images/msus.png')} 
                className="w-40 h-40 mb-4"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-[#874147] mb-1">MANICALAND STATE UNIVERSITY</Text>
              <Text className="text-lg font-semibold text-[#874147] mb-4">APPLIED SCIENCES</Text>
              <Text className="text-xl font-bold text-[#874147] mb-2">Coordinator Portal</Text>
              <Text className="text-lg text-[#874147]">Please login to continue</Text>
            </View>

            {/* Email Input */}
            <Text className="text-lg font-semibold mb-2 text-[#874147]">Email</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-lg mb-4 text-gray-700"
              placeholder="Enter your institutional email"
              placeholderTextColor="gray"
              value={loginInput}
              onChangeText={setLoginInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password Input */}
            <Text className="text-lg font-semibold mb-2 text-[#874147]">Password</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-lg mb-6 text-gray-700"
              placeholder="Enter your password"
              placeholderTextColor="gray"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Login Button - Updated color to match coordinator theme */}
            <TouchableOpacity
              className="bg-[#874147] p-3 rounded-lg flex-row justify-center items-center"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="white" />
                  <Text className="text-white text-lg font-semibold ml-2">Login as Coordinator</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CoordinatorLogin;