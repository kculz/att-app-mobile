import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGetToken from '@/hooks/useGetToken';
import { useApi } from '@/hooks/useApi';

const CoordinatorProfileScreen = () => {
  const router = useRouter();
  const { token, removeToken } = useGetToken();
  const { request, loading, error } = useApi(token);

  const [user, setUser] = useState({
    fullName: '',
    coordinatorId: '',
    email: '',
    phone: '',
    department: '',
    profileImage: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const profileData = await request('/user/coordinator/profile');
      if (profileData) {
        setUser({
          fullName: profileData.fullName,
          coordinatorId: profileData.coordinatorId,
          email: profileData.email,
          phone: profileData.phone || 'Not provided',
          department: profileData.department || 'Not assigned',
          profileImage: profileData.profileImage,
        });
      }
    };

    if (token) fetchProfile();
  }, [token]);

  // Handle image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // You would typically upload this to your server here
    }
  };

  // Handle save changes
  const handleSave = async () => {
    try {
      const updatedData = {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      };

      const response = await request('/user/coordinator/profile', 'PUT', updatedData);
      if (response) {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

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
            await removeToken();
            router.replace('/');
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
          <Text className="text-3xl font-bold text-[#1b583c]">Coordinator Profile</Text>
          <Text className="text-lg text-gray-600 mt-2">
            Manage your profile information
          </Text>
        </View>

        {/* Loading State */}
        {loading && <ActivityIndicator size="large" color="#1b583c" className="my-8" />}

        {/* Error Message */}
        {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

        {/* Profile Details */}
        {!loading && !error && (
          <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
           

            {/* <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Profile Information</Text>
              <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
                <Ionicons 
                  name={isEditing ? 'checkmark-circle' : 'pencil'} 
                  size={24} 
                  color={isEditing ? '#1b583c' : '#3B82F6'} 
                />
              </TouchableOpacity>
            </View> */}

            {isEditing ? (
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-600 mb-1">Full Name</Text>
                  <TextInput
                    className="border border-gray-300 p-3 rounded-lg"
                    value={user.fullName}
                    onChangeText={(text) => setUser({ ...user, fullName: text })}
                  />
                </View>

                <View>
                  <Text className="text-gray-600 mb-1">Email</Text>
                  <TextInput
                    className="border border-gray-300 p-3 rounded-lg"
                    value={user.email}
                    keyboardType="email-address"
                    onChangeText={(text) => setUser({ ...user, email: text })}
                  />
                </View>

                <View>
                  <Text className="text-gray-600 mb-1">Phone</Text>
                  <TextInput
                    className="border border-gray-300 p-3 rounded-lg"
                    value={user.phone}
                    keyboardType="phone-pad"
                    onChangeText={(text) => setUser({ ...user, phone: text })}
                  />
                </View>
              </View>
            ) : (
              <View className="space-y-4">
                <View className="flex flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Full Name:</Text>
                  <Text className="text-gray-900 font-semibold">{user.fullName}</Text>
                </View>

                <View className="flex flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Coordinator ID:</Text>
                  <Text className="text-gray-900 font-semibold">{user.coordinatorId}</Text>
                </View>

                <View className="flex flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Email:</Text>
                  <Text className="text-gray-900 font-semibold">{user.email}</Text>
                </View>

                <View className="flex flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Phone:</Text>
                  <Text className="text-gray-900 font-semibold">{user.phone}</Text>
                </View>

                <View className="flex flex-row justify-between items-center py-2">
                  <Text className="text-gray-600">Department:</Text>
                  <Text className="text-gray-900 font-semibold">{user.department}</Text>
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

export default CoordinatorProfileScreen;