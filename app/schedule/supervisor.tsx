import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';
import useWebSocket from '@/hooks/useWebSocket';

const SupervisorSchedule = () => {
  const router = useRouter();
  const { token } = useGetToken();
  const api = useApi(token);
  
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // WebSocket connection
  const { isConnected, messages } = useWebSocket(token);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg.type === 'incoming_call') {
        handleIncomingCall(latestMsg);
      }
    }
  }, [messages]);

  const handleIncomingCall = (callData) => {
    Alert.alert(
      "Incoming Supervision Call",
      `Supervision session with ${callData.callData.student.name} is starting now.`,
      [
        {
          text: "Decline",
          style: "cancel"
        },
        {
          text: "Join Call", 
          onPress: () => {
            router.push({
              pathname: '/supervision-call',
              params: {
                supervisionId: callData.supervisionId,
                otherUser: callData.callData.student,
                roomId: callData.roomId,
              }
            });
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  const fetchStudents = async () => {
    try {
      const response = await api.request('/supervisions/supervisor', 'GET');
      if (response) {
        const studentData = response.map(supervision => ({
          id: supervision.student._id,
          name: supervision.student.name,
          email: supervision.student.email,
          supervisionId: supervision._id,
          status: supervision.status,
          scheduledDate: supervision.start
        }));
        setStudents(studentData);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      Alert.alert("Error", "Failed to load students. Please try again.");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSetSupervision = async () => {
    if (!selectedStudent) {
      Alert.alert("Error", "Please select a student.");
      return;
    }

    try {
      const payload = {
        studentId: selectedStudent.id,
        date: date.toISOString()
      };
      
      const response = await api.request('/supervisions/set-date', 'POST', payload);
      
      if (response) {
        Alert.alert(
          "Success",
          `Supervision set for ${selectedStudent.name} on ${date.toLocaleString()}`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error("Error setting supervision:", error);
      Alert.alert("Error", "Failed to set supervision. Please try again.");
    }
  };

  const isValidDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date >= tomorrow;
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#874147]">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-white">Set Supervision</Text>
            <View style={{ width: 24 }} />
          </View>
          <Text className="text-lg text-white mt-2">
            Select a student and set a supervision date.
          </Text>
        </View>

        {/* WebSocket Status */}
        <View className="mb-4">
          <Text className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
          </Text>
        </View>

        {api.loading ? (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#1b583c" />
            <Text className="mt-4 text-white">Loading students...</Text>
          </View>
        ) : (
          <>
            {api.error && (
              <View className="mb-4 p-4 bg-red-100 rounded-lg">
                <Text className="text-red-700">{api.error}</Text>
              </View>
            )}

            {/* Student List */}
            <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
              <Text className="text-xl font-bold text-[#1b583c] mb-4">Select Student</Text>
              
              {students.length === 0 ? (
                <Text className="text-[#1b583c] italic">No students found requiring supervision.</Text>
              ) : (
                <View className="space-y-4">
                  {students.map((student) => (
                    <TouchableOpacity
                      key={student.id}
                      className={`p-4 rounded-lg ${
                        selectedStudent?.id === student.id ? 'bg-[#1b583c]' : 'bg-gray-100'
                      }`}
                      onPress={() => setSelectedStudent(student)}
                    >
                      <Text
                        className={`text-lg ${
                          selectedStudent?.id === student.id ? 'text-white' : 'text-[#1b583c]'
                        }`}
                      >
                        {student.name}
                      </Text>
                      {student.scheduledDate && (
                        <Text
                          className={`text-sm mt-1 ${
                            selectedStudent?.id === student.id ? 'text-white opacity-80' : 'text-gray-600'
                          }`}
                        >
                          Currently scheduled: {new Date(student.scheduledDate).toLocaleString()}
                        </Text>
                      )}
                      <Text
                        className={`text-sm mt-1 ${
                          selectedStudent?.id === student.id ? 'text-white opacity-80' : 'text-gray-500'
                        }`}
                      >
                        Status: {student.status || 'pending'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Date Picker */}
            <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
              <Text className="text-xl font-bold text-[#1b583c] mb-4">Set Date and Time</Text>
              <TouchableOpacity
                className="bg-gray-100 p-3 rounded-lg"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-[#1b583c] font-semibold">
                  {date.toLocaleString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              
              {!isValidDate() && (
                <Text className="text-red-500 mt-2">
                  Please select a date at least 24 hours in the future.
                </Text>
              )}
            </View>

            {/* Set Supervision Button */}
            <TouchableOpacity
              className={`p-4 rounded-lg flex-row items-center justify-center ${
                selectedStudent && isValidDate() ? 'bg-[#1b583c]' : 'bg-gray-300'
              }`}
              onPress={handleSetSupervision}
              disabled={!selectedStudent || !isValidDate() || api.loading}
            >
              {api.loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="calendar" size={20} color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">
                    {selectedStudent?.scheduledDate ? 'Update Supervision Date' : 'Set Supervision Date'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupervisorSchedule;