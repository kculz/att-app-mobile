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

  const [refreshing, setRefreshing] = useState(false);

  const quickLinks = [
    { title: 'Student Progress', icon: 'analytics', route: '/progress/supervisor' },
    { title: 'Supervision Schedule', icon: 'calendar', route: '/schedule/supervisor' },
    { title: 'Reports & Logs', icon: 'document-text', route: '/reports/supervisor' },
  ];

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

  useEffect(() => {
    fetchSupervisorChats();
  }, [token]);

  const onRefresh = useCallback(() => {
    fetchSupervisorChats(true);
  }, [fetchSupervisorChats]);

  const retryLoading = () => {
    fetchSupervisorChats();
  };

  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLoading = tokenLoading || apiLoading;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#874147]">
      <ScrollView 
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1b583c']}
            tintColor="#1b583c"
          />
        }
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white">Supervisor Dashboard</Text>
          <Text className="text-lg text-white opacity-80 mt-2">
            Manage your students and track their progress.
          </Text>
        </View>

        {/* Assigned Students with Chats */}
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <Text className="text-xl font-bold text-[#1b583c] mb-4">Student Conversations</Text>
          
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#1b583c" />
              <Text className="mt-4 text-[#1b583c]">Loading student conversations...</Text>
            </View>
          ) : error ? (
            <View className="bg-red-50 p-4 rounded-lg">
              <Text className="text-red-600">{error}</Text>
              <TouchableOpacity 
                className="mt-4 bg-[#1b583c] px-4 py-2 rounded-lg"
                onPress={retryLoading}
              >
                <Text className="text-white text-center">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : !chats || chats.length === 0 ? (
            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-[#1b583c] text-center">No active student conversations found.</Text>
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
                    <Text className="text-lg text-[#1b583c]">
                      {chat.supervision?.student?.name || "Student"}
                    </Text>
                    <Text className="text-[#1b583c] opacity-70 text-sm">
                      Last activity: {formatLastActivity(chat.lastActivity)}
                    </Text>
                  </View>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#1b583c" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Links */}
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <Text className="text-xl font-bold text-[#1b583c] mb-4">Quick Links</Text>
          <View className="flex flex-wrap flex-row -mx-2">
            {quickLinks.map((link, index) => (
              <View key={index} className="w-1/2 px-2 mb-4">
                <TouchableOpacity
                  className="bg-[#1b583c] p-6 rounded-2xl shadow-sm flex items-center justify-center"
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