import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';

const StudentChatScreen = () => {
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const { token } = useGetToken();
  const { request } = useApi(token);
  const router = useRouter();

  // Fetch user information
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const parsedUserInfo = JSON.parse(userInfoString);
          setUserInfo(parsedUserInfo);
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
        setError('Failed to load user information');
      }
    };

    getUserInfo();
  }, []);

  // Fetch student's chat
  useEffect(() => {
    const fetchChat = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const chatData = await request('/chats/student', 'GET');
        
        if (chatData) {
          setChat(chatData);
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
        setError('Failed to load your supervision chat');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [token, request]);

  // Navigate to chat detail page
  const navigateToChat = () => {
    if (chat) {
      // Find the supervisor name from the chat data
      const supervisorName = "My Supervisor"; // Default fallback
      
      router.push({
        pathname: "/chats/[chat]",
        params: { 
          id: chat._id, 
          name: supervisorName 
        }
      });
    }
  };

  // Retry loading if there was an error
  const retryLoading = () => {
    setLoading(true);
    setError(null);
    
    const fetchChat = async () => {
      try {
        const chatData = await request('/chats/student', 'GET');
        setChat(chatData);
      } catch (error) {
        console.error('Error fetching chat:', error);
        setError('Failed to load your supervision chat');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1">
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white p-6 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900">My Supervision</Text>
          {userInfo && (
            <Text className="text-gray-500 mt-1">
              Welcome back, {userInfo.name}
            </Text>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-gray-600">Loading your supervision...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center p-6">
            <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
            <Text className="text-gray-700 text-lg font-semibold mt-4 text-center">{error}</Text>
            <TouchableOpacity 
              className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
              onPress={retryLoading}
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : chat ? (
          <View className="flex-1 p-4">
            <View className="bg-white rounded-xl shadow-sm overflow-hidden">
              <View className="p-6 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-900">Your Supervision Chat</Text>
                <Text className="text-gray-500 mt-2">
                  Last active: {format(new Date(chat.lastActivity), 'MMM d, yyyy h:mm a')}
                </Text>
              </View>
              
              <View className="p-6">
                <Text className="text-gray-700 mb-4">
                  Stay in touch with your supervisor through this chat. You can discuss your progress, ask questions, and share updates.
                </Text>
                
                <View className="flex-row items-center mb-6">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-2"></View>
                  <Text className="text-green-500 font-medium">
                    {chat.messages.length > 0 
                      ? `${chat.messages.length} messages in this conversation` 
                      : 'Start a new conversation'}
                  </Text>
                </View>
                
                <TouchableOpacity
                  className="bg-blue-500 py-4 rounded-lg"
                  onPress={navigateToChat}
                >
                  <View className="flex-row justify-center items-center">
                    <Ionicons name="chatbubble-ellipses" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Open Chat</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center p-6">
            <Ionicons name="chatbubbles-outline" size={80} color="#9CA3AF" />
            <Text className="text-gray-700 text-xl font-semibold mt-6 text-center">
              No supervision chat found
            </Text>
            <Text className="text-gray-500 text-base mt-2 text-center">
              You don't have an active supervision at the moment.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default StudentChatScreen;