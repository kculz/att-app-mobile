import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGetToken from '@/hooks/useGetToken';
import { useApi } from '@/hooks/useApi';

const ProfileScreen = () => {
  const router = useRouter();
  const { token, removeToken } = useGetToken();
  const { request, loading, error } = useApi(token);

  const [user, setUser] = useState({
    fullName: '',
    supervisorId: '',
    email: '',
    phone: '',
    assignedCourse: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const profileData = await request('/user/supervisor/profile');
      if (profileData) {
        setUser({
          fullName: profileData.fullName,
          supervisorId: profileData.supervisorId,
          email: profileData.email,
          phone: profileData.phone || 'Not provided',
          assignedCourse: profileData.assignedCourse || 'Not assigned',
        });
      }
    };

    if (token) fetchProfile();
  }, [token]);

  // Handle Logout
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            await removeToken(); // Clear token from AsyncStorage
            router.replace('/'); // Redirect to login screen
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Profile</Text>
          <Text className="text-lg text-gray-600 mt-2">
            Manage your profile and settings.
          </Text>
        </View>

        {/* Loading State */}
        {loading && <ActivityIndicator size="large" color="#3B82F6" />}

        {/* Error Message */}
        {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

        {/* Profile Details */}
        {!loading && !error && (
          <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Personal Information</Text>
              <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                <Ionicons name={isEditing ? 'checkmark' : 'pencil'} size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <View className="space-y-4">
                <TextInput
                  className="bg-gray-100 p-3 rounded-lg"
                  placeholder="Full Name"
                  value={user.fullName}
                  placeholderTextColor={'gray'}
                  onChangeText={(text) => setUser({ ...user, fullName: text })}
                />
                <TextInput
                  className="bg-gray-100 p-3 rounded-lg"
                  placeholder="Email"
                  value={user.email}
                  placeholderTextColor={'gray'}
                  onChangeText={(text) => setUser({ ...user, email: text })}
                />
                <TextInput
                  className="bg-gray-100 p-3 rounded-lg"
                  placeholder="Phone"
                  value={user.phone}
                  placeholderTextColor={'gray'}
                  onChangeText={(text) => setUser({ ...user, phone: text })}
                />
              </View>
            ) : (
              <View className="space-y-4">
                <View className="flex flex-row justify-between items-center">
                  <Text className="text-gray-600">Full Name:</Text>
                  <Text className="text-gray-900 font-semibold">{user.fullName}</Text>
                </View>
                <View className="flex flex-row justify-between items-center">
                  <Text className="text-gray-600">Supervisor ID:</Text>
                  <Text className="text-gray-900 font-semibold">{user.supervisorId}</Text>
                </View>
                <View className="flex flex-row justify-between items-center">
                  <Text className="text-gray-600">Email:</Text>
                  <Text className="text-gray-900 font-semibold">{user.email}</Text>
                </View>
                <View className="flex flex-row justify-between items-center">
                  <Text className="text-gray-600">Phone:</Text>
                  <Text className="text-gray-900 font-semibold">{user.phone}</Text>
                </View>
                <View className="flex flex-row justify-between items-center">
                  <Text className="text-gray-600">Assigned Course:</Text>
                  <Text className="text-gray-900 font-semibold">{user.assignedCourse}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 p-3 rounded-lg flex-row items-center justify-center"
        >
          <Ionicons name="log-out" size={20} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
