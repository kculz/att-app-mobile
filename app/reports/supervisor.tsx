import { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { useApi } from "../../hooks/useApi";
import useGetToken from "../../hooks/useGetToken";

const SupervisorReports = () => {
  const { token, loading: tokenLoading } = useGetToken();
  const { request, loading, error } = useApi(token);
  const [reports, setReports] = useState<any[]>([]); // Store reports

  const fetchReports = async () => {
    const response = await request("/report/supervisor", "GET");

    if (response) {
      console.log("API Response:", response);
      setReports(Array.isArray(response) ? response : []); // Ensure response is an array
    } else {
      console.error("API returned undefined or null");
      setReports([]); // Fallback to empty array
    }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  if (loading || tokenLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-red-500 text-lg">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {reports?.length > 0 ? (
          reports.map((report) => (
            <View key={report._id} className="bg-white p-6 rounded-2xl shadow-sm mb-4">
              <Text className="text-xl font-bold text-gray-900 mb-2">{report.student.name}</Text>
              <Text className="text-gray-500">Week {report.weekNumber}</Text>
              <Text className="text-gray-500">Status: {report.status}</Text>
              <Text className="text-gray-500">Created At: {new Date(report.createdAt).toDateString()}</Text>

              {/* Tasks Section */}
              <View className="mt-4">
                <Text className="text-lg font-semibold text-gray-900">Tasks</Text>
                {report.tasks?.length > 0 ? (
                  report.tasks.map((task, index) => (
                    <View key={index} className="border-b border-gray-200 py-2">
                      <Text className="text-gray-700">Summary: {task.summary}</Text>
                      <Text className="text-gray-700">Challenges: {task.challenges}</Text>
                      <Text className="text-gray-700">Achievements: {task.achievements}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500">No tasks recorded.</Text>
                )}
              </View>

              {/* Working Days Section */}
              <View className="mt-4">
                <Text className="text-lg font-semibold text-gray-900">Working Days</Text>
                {report.workingDays?.length > 0 ? (
                  report.workingDays.map((day, index) => (
                    <Text key={index} className="text-gray-700">
                      {new Date(day).toDateString()}
                    </Text>
                  ))
                ) : (
                  <Text className="text-gray-500">No working days recorded.</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text className="text-center text-gray-600">No reports available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupervisorReports;
