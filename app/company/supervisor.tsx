import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Companies = () => {
  const router = useRouter();

  // Sample data for companies the student is attached to
  const companies = [
    {
      id: 1,
      name: 'Tech Innovators Inc.',
      location: 'San Francisco, CA',
      duration: 'Jan 2023 - Present',
    },
    {
      id: 2,
      name: 'Green Energy Solutions',
      location: 'Austin, TX',
      duration: 'Jun 2022 - Dec 2022',
    },
    {
      id: 3,
      name: 'Future Builders Ltd.',
      location: 'New York, NY',
      duration: 'Sep 2021 - May 2022',
    },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-900">Companies</Text>
            <View style={{ width: 24 }} /> {/* Placeholder to balance the header */}
          </View>
          <Text className="text-lg text-gray-600 mt-2">
            View the companies you are attached to.
          </Text>
        </View>

        {/* Companies List */}
        <View className="space-y-6">
          {companies.map((company) => (
            <View key={company.id} className="bg-white p-6 rounded-2xl shadow-sm">
              <Text className="text-xl font-bold text-gray-900 mb-2">{company.name}</Text>
              <Text className="text-gray-600">{company.location}</Text>
              <Text className="text-gray-600 mt-1">{company.duration}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Companies;