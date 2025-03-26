import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';

const SupervisorDashboard = () => {
  const router = useRouter();
  const { token, loading: tokenLoading } = useGetToken();
  const { 
    data: chats, 
    error, 
    loading: apiLoading, 
    request 
  } = useApi<any[]>(token);

  // State to manage refresh
  const [refreshing, setRefreshing] = useState(false);

  // Quick links for the supervisor
  const quickLinks = [
    { title: 'Student Progress', icon: 'analytics', route: '/progress/supervisor' },
    { title: 'Supervision Schedule', icon: 'calendar', route: '/schedule/supervisor' },
    { title: 'Reports & Logs', icon: 'document-text', route: '/reports/supervisor' },
  ];

  // Fetch supervisor chats
  const fetchSupervisorChats = useCallback(async (isRefresh = false) => {
    if (!token) return;

    try {
      if (isRefresh) setRefreshing(true);
      
      await request('/chats/supervisor');
    } catch (err) {
      console.error('Error fetching supervisor chats:', err);
    } finally {
      setRefreshing(false);
    }
  }, [token, request]);

  // Fetch chats when component mounts or token changes
  useEffect(() => {
    fetchSupervisorChats();
  }, [token]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    fetchSupervisorChats(true);
  }, [fetchSupervisorChats]);

  // Retry loading chats
  const retryLoading = () => {
    fetchSupervisorChats();
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

  // Determine overall loading state
  const isLoading = tokenLoading || apiLoading;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']} // Android
            tintColor="#3B82F6" // iOS
            title="Pull to refresh" // iOS
          />
        }
      >
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
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-4 text-gray-600">Loading student conversations...</Text>
            </View>
          ) : error ? (
            <View className="bg-red-50 p-4 rounded-lg">
              <Text className="text-red-600">{error}</Text>
              <TouchableOpacity 
                className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
                onPress={retryLoading}
              >
                <Text className="text-white text-center">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : !chats || chats.length === 0 ? (
            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-gray-600 text-center">No active student conversations found.</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {chats.map((chat) => (
                <TouchableOpacity
                  key={chat._id}
                  className="bg-gray-100 p-4 rounded-lg flex-row justify-between items-center"
                  onPress={() => router.push({
                    pathname: `/chats/[chat]`,
                    params: { 
                      id: chat._id, 
                      name: chat.supervision?.student?.name || "Student" 
                    }
                  })}
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