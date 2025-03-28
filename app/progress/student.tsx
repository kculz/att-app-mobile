import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';
import { useEffect } from 'react';

const StudentProgress = () => {
  const router = useRouter();
  const { token, loading: tokenLoading } = useGetToken();
  
  // Fetch the weekly reports using the useApi hook
  const { data: progressData, error, loading, request } = useApi(token);

  // Fetch the weekly reports when the component mounts and token is available
  useEffect(() => {
    if (token) {
      request("/report/weekly", "GET");
    }
  }, [token, request]);

  // Handle loading states
  if (tokenLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-600">Loading credentials...</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-600">Loading progress data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 justify-center items-center p-6">
        <Text className="text-xl font-bold text-red-500 mb-2">Error Loading Data</Text>
        <Text className="text-gray-600 text-center">{error}</Text>
        <View className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <Text className="text-gray-600">Please check your connection and try again later.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 justify-center items-center p-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">Authentication Required</Text>
        <Text className="text-gray-600 text-center">Please sign in to view your progress.</Text>
      </SafeAreaView>
    );
  }

  // Use the actual data from API if available, otherwise use default values
  const progress = progressData || {
    totalWeeks: 0,
    weeksCompleted: 0,
    weeksLeft: 0,
    weeklyReports: []
  };

  // Calculate progress stats
  const percentageCompleted = progress.totalWeeks > 0 
    ? Math.round((progress.weeksCompleted / progress.totalWeeks) * 100) 
    : 0;

  // Calculate tasks stats (if available in the API data)
  const tasksCompleted = progress.weeklyReports
    ? progress.weeklyReports.reduce((total, report) => {
        return total + (report.tasks ? report.tasks.filter(task => task.completed).length : 0);
      }, 0)
    : 0;
    
  const totalTasks = progress.weeklyReports
    ? progress.weeklyReports.reduce((total, report) => {
        return total + (report.tasks ? report.tasks.length : 0);
      }, 0)
    : 0;
    
  const tasksPercentage = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Internship Progress</Text>
          <Text className="text-base text-gray-600 mt-1">
            Track your progress and stay on schedule
          </Text>
        </View>

        {/* Progress Overview Card */}
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Overview</Text>
          
          {/* Progress Bar */}
          <View className="mb-6">
            <View className="flex flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Completion</Text>
              <Text className="text-[#1b583c] font-bold">{percentageCompleted}%</Text>
            </View>
            <View className="bg-gray-200 rounded-full h-3">
              <View
                className="bg-primary-500 rounded-full h-3"
                style={{ width: `${percentageCompleted}%` }}
              />
            </View>
          </View>
          
          <View className="flex flex-row justify-between mb-1">
            <View className="w-1/2">
              <Text className="text-gray-500 text-sm">Weeks Completed</Text>
              <Text className="text-gray-900 font-bold text-xl">{progress.weeksCompleted}</Text>
            </View>
            <View className="w-1/2">
              <Text className="text-gray-500 text-sm">Weeks Remaining</Text>
              <Text className="text-gray-900 font-bold text-xl">{progress.weeksLeft}</Text>
            </View>
          </View>
          
          <View className="flex flex-row justify-between mt-4">
            <View className="w-1/2">
              <Text className="text-gray-500 text-sm">Total Duration</Text>
              <Text className="text-gray-900 font-bold text-xl">{progress.totalWeeks} weeks</Text>
            </View>
            <View className="w-1/2">
              <Text className="text-gray-500 text-sm">Current Status</Text>
              <Text className="text-green-600 font-bold text-xl">On Track</Text>
            </View>
          </View>
        </View>

        {/* Tasks Overview Card (if task data is available) */}
        {totalTasks > 0 && (
          <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Tasks</Text>
            
            <View className="mb-6">
              <View className="flex flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Task Completion</Text>
                <Text className="text-[#1b583c] font-bold">{tasksPercentage}%</Text>
              </View>
              <View className="bg-gray-200 rounded-full h-3">
                <View
                  className="bg-primary-500 rounded-full h-3"
                  style={{ width: `${tasksPercentage}%` }}
                />
              </View>
            </View>
            
            <View className="flex flex-row justify-between">
              <View className="w-1/2">
                <Text className="text-gray-500 text-sm">Completed</Text>
                <Text className="text-gray-900 font-bold text-xl">{tasksCompleted}</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-gray-500 text-sm">Total</Text>
                <Text className="text-gray-900 font-bold text-xl">{totalTasks}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Weekly Reports Summary (if reports data is available) */}
        {progress.weeklyReports && progress.weeklyReports.length > 0 && (
          <View className="bg-white p-6 rounded-2xl shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-4">Recent Reports</Text>
            
            {progress.weeklyReports.slice(0, 3).map((report, index) => (
              <View key={index} className="py-3 border-b border-gray-100 last:border-0">
                <Text className="text-gray-900 font-semibold">Week {report.weekNumber}</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {report.status || "No status"} • {report.workingDays?.length || 0} Working Days
                </Text>
              </View>
            ))}
            
            {progress.weeklyReports.length > 3 && (
              <Text 
                className="text-primary-500 font-semibold text-center mt-4"
                onPress={() => router.push('/reports/student')}
              >
                View All Reports
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProgress;