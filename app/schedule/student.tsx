import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import useGetToken from '@/hooks/useGetToken'; // Ensure correct import path
import { useApi } from '@/hooks/useApi'; // Ensure correct import path
import { format, differenceInDays, differenceInHours, isValid } from 'date-fns';

const StudentSchedule = () => {
  const router = useRouter();
  const { token, loading: tokenLoading } = useGetToken();
  const { request, data, loading, error } = useApi(token);
  const [supervision, setSupervision] = useState(null);

  useEffect(() => {
    if (token) {
      fetchStudentSupervision();
    }
  }, [token]);

  const fetchStudentSupervision = async () => {
    const response = await request('/supervisions/student', 'GET');
    console.log("API Response:", response); // Debug the API response
    if (response && response.length > 0) {
      setSupervision(response[0]); // Use the first supervision in the array
    }
  };

  // Calculate time remaining using date-fns
  const timeRemaining = () => {
    if (!supervision || !supervision?.start) return 'No upcoming supervision';

    const now = new Date();
    const supervisionDate = new Date(supervision.start);

    // Check if the date is valid
    if (!isValid(supervisionDate)) {
      return 'Invalid supervision date';
    }

    const daysRemaining = differenceInDays(supervisionDate, now);
    const hoursRemaining = differenceInHours(supervisionDate, now) % 24;

    if (daysRemaining > 0) {
      return `${daysRemaining} days ${hoursRemaining} hours remaining`;
    } else if (hoursRemaining > 0) {
      return `${hoursRemaining} hours remaining`;
    } else {
      return 'Supervision is due now!';
    }
  };

  if (tokenLoading || loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-red-500">Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 p-4">
      <ScrollView className="space-y-4">
        {/* Header */}
        <View className="bg-[#1b583c] p-4 rounded-lg">
          <Text className="text-white text-xl font-bold">Supervision Schedule</Text>
          <Text className="text-white text-sm">View your upcoming supervision details.</Text>
        </View>

        {/* Supervision Details */}
        {supervision ? (
          <View className="bg-white p-4 rounded-lg shadow">
            <Text className="text-lg font-bold">Upcoming Supervision</Text>
            <View className="mt-2">
              <Text className="font-semibold">Date:</Text>
              <Text>
                {supervision.start && isValid(new Date(supervision.start))
                  ? format(new Date(supervision.start), 'PPPPp') // Use `start` field
                  : 'Invalid date'}
              </Text>
            </View>
            <View className="mt-2">
              <Text className="font-semibold">Supervisor:</Text>
              <Text>{supervision.supervisor?.name || 'No supervisor assigned'}</Text>
            </View>
            <View className="mt-2">
              <Text className="font-semibold">Time Remaining:</Text>
              <Text>{timeRemaining()}</Text>
            </View>
          </View>
        ) : (
          <Text>No upcoming supervision sessions.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentSchedule;