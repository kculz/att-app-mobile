import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';

const ChatDetailScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { token, userId } = useGetToken();
  const { request } = useApi(token);
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const flatListRef = useRef(null);

  // Fetch chat messages
  const fetchMessages = async () => {
    if (!token || !id) return;
    
    try {
      setError(null);
      
      const chatData = await request(`/chats/${id}`, 'GET');
    
      // Handle both single chat and chat list responses
      const messagesData = Array.isArray(chatData) 
        ? chatData[0]?.messages || [] 
        : chatData.messages || [];
      
      setMessages(messagesData);
      
      return chatData;
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load of messages
  useEffect(() => {
    fetchMessages();
  }, [token, id]);

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !token || !id) return;
    
    try {
      setSendingMessage(true);
      setError(null);
      
      const messageData = await request(`/chats/${id}/messages`, 'POST', {
        content: newMessage.trim()
      });
      
      if (messageData) {
        // Add the new message to the list
        setMessages(prevMessages => [...prevMessages, messageData]);
        setNewMessage(''); // Clear the input
        
        // Scroll to the bottom
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle refresh/pull to reload
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  // Go back
  const goBack = () => {
    router.back();
  };

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };

  // Render a message item
  const renderMessageItem = ({ item }) => {
    const isMyMessage = userId && item.sender._id === userId;
    console.log("__________", userId, "+++++++++++++++", item.sender._id);
    
    return (
      <View className={`mb-4 max-w-4/5 ${isMyMessage ? 'self-end' : 'self-start'}`}>
        <View className={`p-3 rounded-2xl ${
          isMyMessage 
            ? 'bg-blue-500' 
            : item.sender.role === 'supervisor' 
              ? 'bg-green-500' 
              : 'bg-gray-200'
        }`}>
          <Text className={`${
            isMyMessage 
              ? 'text-white' 
              : item.sender.role === 'supervisor' 
                ? 'text-white' 
                : 'text-gray-800'
          }`}>
            {item.content}
          </Text>
        </View>
        <View className={`flex-row items-center mt-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
          <Text className="text-xs text-gray-500 mr-1">
            {formatMessageTime(item.timestamp)}
          </Text>
          {isMyMessage && item.isRead && (
            <Ionicons name="checkmark-done" size={14} color="#4B5563" />
          )}
          {!isMyMessage && (
            <Text className="text-xs text-gray-500 ml-1">
              {item.sender.name}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        className="flex-1"
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="bg-white p-4 flex-row items-center border-b border-gray-200">
            <TouchableOpacity onPress={goBack} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#4B5563" />
            </TouchableOpacity>
            <View>
              <Text className="text-lg font-bold text-gray-900">{name || 'Chat'}</Text>
            </View>
          </View>

          {/* Message List */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-4 text-gray-600">Loading messages...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-6">
              <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
              <Text className="text-gray-700 text-lg font-semibold mt-4 text-center">{error}</Text>
              <TouchableOpacity 
                className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
                onPress={handleRefresh}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={renderMessageItem}
              contentContainerStyle={{ padding: 16 }}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center p-6">
                  <Ionicons name="chatbubble-outline" size={60} color="#9CA3AF" />
                  <Text className="text-gray-700 text-lg font-semibold mt-4 text-center">
                    No messages yet
                  </Text>
                  <Text className="text-gray-500 mt-2 text-center">
                    Send a message to start the conversation
                  </Text>
                </View>
              }
              onContentSizeChange={() => {
                if (messages.length > 0 && flatListRef.current) {
                  flatListRef.current.scrollToEnd({ animated: false });
                }
              }}
              onLayout={() => {
                if (messages.length > 0 && flatListRef.current) {
                  flatListRef.current.scrollToEnd({ animated: false });
                }
              }}
            />
          )}

          {/* Message Input */}
          <View className="bg-white p-2 border-t border-gray-200 flex-row items-center pb-5 mb-5">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              className={`rounded-full p-2 ${newMessage.trim() ? 'bg-blue-500' : 'bg-gray-300'}`}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sendingMessage}
            >
              {sendingMessage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetailScreen;