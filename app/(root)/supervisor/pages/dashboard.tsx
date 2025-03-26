import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';

const SupervisorDashboard = () => {
  const router = useRouter();
  const { token, loading: tokenLoading } = useGetToken();
  const { data: chats, error, loading: chatsLoading, request } = useApi(token);
  
  // Quick links for the supervisor
  const quickLinks = [
    { title: 'Student Progress', icon: 'analytics', route: '/progress/supervisor' },
    { title: 'Supervision Schedule', icon: 'calendar', route: '/schedule/supervisor' },
    { title: 'Reports & Logs', icon: 'document-text', route: '/reports/supervisor' },
  ];

  useEffect(() => {
    // Only fetch chats once we have the token
    if (token && !tokenLoading) {
      fetchSupervisorChats();
    }
  }, [token, tokenLoading]);

  const fetchSupervisorChats = async () => {
    try {
      await request('/chats/supervisor', 'GET');
    } catch (err) {
      console.error('Error in fetchSupervisorChats:', err);
    }
  };

  // Format date for display
  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine if we're in a loading state
  const isLoading = tokenLoading || chatsLoading;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Supervisor Dashboard</Text>
          <Text className="text-lg text-gray-600 mt-2">
            Manage your students and track their progress.
          </Text>
        </View>

        {/* Assigned Students with Chats */}
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Student Conversations</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" className="py-4" />
          ) : error ? (
            <View className="bg-red-50 p-4 rounded-lg">
              <Text className="text-red-600">{error}</Text>
            </View>
          ) : !chats || chats.length === 0 ? (
            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-gray-600">No active student conversations found.</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {chats.map((chat) => (
                <TouchableOpacity
                  key={chat._id}
                  className="bg-gray-100 p-4 rounded-lg flex-row justify-between items-center"
                  onPress={() => router.push(`/chats/${chat._id}`)}
                >
                  <View>
                    <Text className="text-lg text-gray-900">
                      {chat.supervision?.student?.name || "Student"}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Last activity: {formatLastActivity(chat.lastActivity)}
                    </Text>
                  </View>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#4F46E5" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Links */}
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Links</Text>
          <View className="flex flex-wrap flex-row -mx-2">
            {quickLinks.map((link, index) => (
              <View key={index} className="w-1/2 px-2 mb-4">
                <TouchableOpacity
                  className="bg-primary-500 p-6 rounded-2xl shadow-sm flex items-center justify-center"
                  onPress={() => router.push(link.route)}
                >
                  <Ionicons name={link.icon} size={32} color="white" />
                  <Text className="text-white font-semibold text-lg mt-2 text-center">
                    {link.title}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupervisorDashboard;