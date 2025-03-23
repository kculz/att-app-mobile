import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApi } from "@/hooks/useApi";
import useGetToken from "@/hooks/useGetToken";

const StudentProfile = () => {
  const router = useRouter();
  const { token, loading: tokenLoading, removeToken } = useGetToken(); // Get the token and removeToken function
  const { data, error, loading, request } = useApi(token); // Pass the token to useApi
  const [student, setStudent] = useState({
    fullName: "",
    studentId: "",
    degree: "",
    degreeLevel: "",
    feeStatus: {
      semester: "",
      status: "",
      balance: "",
    },
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          console.log("Fetching student profile...");
          const profileData = await request("/user/student/profile", "GET");
          console.log("Profile data received:", profileData);

          if (profileData) {
            setStudent({
              fullName: profileData.fullName || "",
              studentId: profileData.studentId || "",
              degree: profileData.degree || "",
              degreeLevel: profileData.degreeLevel || "",
              feeStatus: profileData.feeStatus || {
                semester: "",
                status: "",
                balance: "",
              },
            });
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
    };

    fetchProfile();
  }, [token, request]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await removeToken(); // Clear the token from storage
      router.replace("/"); // Redirect to the login page
    } catch (err) {
      console.error("Error during logout:", err);
      Alert.alert("Logout Error", "An error occurred while logging out.");
    }
  };

  if (tokenLoading || loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 p-3 rounded-lg"
          onPress={() => router.push("/")}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-500">
      <ScrollView className="flex-1 bg-gray-50 p-6">
        {/* Header */}
        <View className="mb-8 top-0 left-0 right-0 z-10 bg-white p-6 shadow-sm rounded-xl">
          <Text className="text-3xl font-bold text-gray-900">Student Profile</Text>
          <Text className="text-lg text-gray-600 mt-2">View and manage your profile details.</Text>
        </View>

        {/* Student Details Section */}
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Personal Information</Text>

          <View className="space-y-4">
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Full Name:</Text>
              <Text className="text-gray-900 font-semibold">{student.fullName || "Not available"}</Text>
            </View>

            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Student ID:</Text>
              <Text className="text-gray-900 font-semibold">{student.studentId || "Not available"}</Text>
            </View>

            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Degree/Course:</Text>
              <Text className="text-gray-900 font-semibold">{student.degree || "Not available"}</Text>
            </View>

            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Degree Level:</Text>
              <Text className="text-gray-900 font-semibold">{student.degreeLevel || "Not available"}</Text>
            </View>
          </View>
        </View>

        {/* Fee Status Section */}
        <View className="bg-white p-6 rounded-2xl shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-4">Fee Status</Text>

          <View className="space-y-4">
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Semester:</Text>
              <Text className="text-gray-900 font-semibold">{student.feeStatus?.semester || "Not available"}</Text>
            </View>

            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Status:</Text>
              <Text
                className={`font-semibold ${
                  student.feeStatus?.status === "Fully Paid" ? "text-green-600" : "text-red-600"
                }`}
              >
                {student.feeStatus?.status || "Not available"}
              </Text>
            </View>

            {student.feeStatus?.status !== "Fully Paid" && student.feeStatus?.balance && (
              <View className="flex flex-row justify-between items-center">
                <Text className="text-gray-600">Balance:</Text>
                <Text className="text-gray-900 font-semibold">{student.feeStatus.balance}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="mt-6 bg-red-500 p-3 rounded-lg flex-row items-center justify-center"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProfile;