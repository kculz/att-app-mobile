import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import useGetToken from "@/hooks/useGetToken";

const SupervisorProgress = () => {
  const router = useRouter();
  const { token, loading: tokenLoading } = useGetToken();
  const { data, error, loading, request } = useApi(token);
  const [studentsProgress, setStudentsProgress] = useState([]);

  // Fetch students' progress on component mount
  useEffect(() => {
    const fetchStudentsProgress = async () => {
      if (token) {
        try {
          const progressData = await request("/report/students-progress", "GET");
          if (progressData) {
            setStudentsProgress(progressData);
          }
        } catch (err) {
          console.error("Error fetching students' progress:", err);
        }
      }
    };

    fetchStudentsProgress();
  }, [token, request]);

  if (tokenLoading || loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#874147]">
        <ActivityIndicator size="large" color="#1b583c" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-[#874147]">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-[#1b583c] p-3 rounded-lg"
          onPress={() => router.push("/")}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#874147]">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-white">Student Progress</Text>
            <View style={{ width: 24 }} />
          </View>
          <Text className="text-lg text-white mt-2">
            Track the progress of your assigned students.
          </Text>
        </View>

        {/* Student Progress List */}
        <View className="space-y-4">
          {studentsProgress.length > 0 ? (
            studentsProgress.map((student) => {
              const progressPercentage = Math.round(
                (student.weeksCompleted / student.totalWeeks) * 100
              );

              return (
                <View 
                  key={student.studentId} 
                  className="bg-white p-6 rounded-2xl shadow-sm"
                >
                  <Text className="text-xl font-bold text-[#1b583c] mb-4">
                    {student.studentName}
                  </Text>
                  <View className="space-y-4">
                    <View className="flex flex-row justify-between items-center">
                      <Text className="text-[#1b583c]">Weeks Completed:</Text>
                      <Text className="text-[#1b583c] font-semibold">
                        {student.weeksCompleted } / {student.totalWeeks} ({progressPercentage}%)
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="py-8">
              <Text className="text-[#1b583c] text-center">
                No student progress data available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupervisorProgress;