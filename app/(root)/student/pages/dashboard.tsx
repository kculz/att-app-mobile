import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const StudentDashboard = () => {
  const router = useRouter();
  const userName = "John Doe"; // Replace with dynamic user name from state or context

  const features = [
    { title: 'Chats', icon: 'chatbubbles', route: '/chats' },
    { title: 'Internship Details', icon: 'briefcase', route: '/internship-details' },
    { title: 'Institute Log Book', icon: 'book', route: '/reports/student' },
    { title: 'Schedule & Deadlines', icon: 'calendar', route: '/schedule/student' },
    { title: 'Progress Tracking', icon: 'analytics', route: '/progress/student' },
    { title: 'Profile', icon: 'person', route: '/profile/student' },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1  ">
      {/* Welcome Header */}
      <View className="bg-white p-6 shadow-sm">
        <Text className="text-3xl font-bold text-gray-900">Welcome, {userName}!</Text>
        <Text className="text-lg text-gray-600 mt-2">
          Let's make today productive and meaningful.
        </Text>
      </View>

      {/* Feature Grid */}
      <View className="flex-1 p-6">
        <View className="flex flex-wrap flex-row -mx-2">
          {features.map((item, index) => (
            <View key={index} className="w-1/2 px-2 mb-4">
              <TouchableOpacity
                className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-center border border-gray-100"
                onPress={() => router.push(item.route)}
                activeOpacity={0.8}
                style={{ height: 150 }} // Fixed height for all cards
              >
                <Ionicons name={item.icon} size={32} color="#3B82F6" />
                <Text className="text-gray-800 font-semibold text-lg mt-2 text-center">
                  {item.title}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StudentDashboard;