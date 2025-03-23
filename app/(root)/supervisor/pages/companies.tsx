import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import useGetToken from "@/hooks/useGetToken";

const Companies = () => {
  const router = useRouter();
  const { token, loading: tokenLoading } = useGetToken();
  const { data, error, loading, request } = useApi(token);
  const [companies, setCompanies] = useState([]);

  // Fetch companies and students on component mount
  useEffect(() => {
    const fetchCompaniesAndStudents = async () => {
      if (token) {
        try {
          const response = await request("/internship/companies-students", "GET");
          if (response) {
            setCompanies(response);
          }
        } catch (err) {
          console.error("Error fetching companies and students:", err);
        }
      }
    };

    fetchCompaniesAndStudents();
  }, [token, request]);

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
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
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
            View the companies and students attached to them.
          </Text>
        </View>

        {/* Companies List */}
        <View className="space-y-6">
          {companies.map((company, index) => (
            <View key={index} className="bg-white p-6 rounded-2xl shadow-sm">
              <Text className="text-xl font-bold text-gray-900 mb-2">{company.name}</Text>
              <Text className="text-gray-600">{company.location}</Text>

              {/* Students List */}
              <View className="mt-4">
                <Text className="text-lg font-semibold text-gray-900 mb-2">Students:</Text>
                {company.students.map((student, idx) => (
                  <View key={idx} className="mb-2">
                    <Text className="text-gray-600">{student.studentName}</Text>
                    <Text className="text-gray-500 text-sm">
                      {new Date(student.startDate).toLocaleDateString()} -{" "}
                      {new Date(student.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Companies;