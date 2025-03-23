import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const SupervisorStudents = () => {
  const router = useRouter();

  // Sample list of assigned students (replace with dynamic data from API or state)
  const students = [
    {
      id: 1,
      name: 'John Doe',
      progress: '65%',
      internship: 'Tech Innovators Ltd',
      supervisor: 'Dr. Jane Smith',
    },
    {
      id: 2,
      name: 'Jane Smith',
      progress: '80%',
      internship: 'Future Tech Solutions',
      supervisor: 'Dr. John Doe',
    },
    {
      id: 3,
      name: 'Alice Johnson',
      progress: '45%',
      internship: 'Innovate Now',
      supervisor: 'Dr. Jane Smith',
    },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Assigned Students</Text>
          <Text className="text-lg text-gray-600 mt-2">
            View and manage your assigned students.
          </Text>
        </View>

        {/* Student List */}
        <View className="space-y-4">
          {students.map((student) => (
            <TouchableOpacity
              key={student.id}
              className="bg-white p-6 rounded-2xl shadow-sm"
              onPress={() => router.push(`/supervisor/students/${student.id}`)} // Navigate to student details
            >
              <View className="flex flex-row justify-between items-center">
                <Text className="text-xl font-bold text-gray-900">{student.name}</Text>
                <Text className="text-gray-600">{student.progress} completed</Text>
              </View>
              <View className="mt-4 space-y-2">
                <View className="flex flex-row justify-between items-center">
                  <Text className="text-gray-600">Internship:</Text>
                  <Text className="text-gray-900 font-semibold">{student.internship}</Text>
                </View>
                <View className="flex flex-row justify-between items-center">
                  <Text className="text-gray-600">Supervisor:</Text>
                  <Text className="text-gray-900 font-semibold">{student.supervisor}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupervisorStudents;