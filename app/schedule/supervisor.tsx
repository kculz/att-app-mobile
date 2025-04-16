import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';
import { useWebSocketContext } from '@/context/WebSocketContext';
import CallButton from '@/components/CallButton';

const SupervisorSchedule = () => {
  const router = useRouter();
  const { token } = useGetToken();
  const api = useApi(token);
  const { isConnected, messages } = useWebSocketContext();
  
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [supervisionDates, setSupervisionDates] = useState([]);
  const [isWithinAllowedDates, setIsWithinAllowedDates] = useState(true);
  const [datesLoading, setDatesLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchStudents();
      fetchSupervisionDates();
    }
  }, [token]);

  // Monitor for incoming calls
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg.type === 'incoming_call') {
        handleIncomingCall(latestMsg);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (date) {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
      
      if (supervisionDates.length === 0) {
        setIsWithinAllowedDates(date >= now);
        return;
      }

      const isValid = supervisionDates.some(range => {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        return (date >= start && date <= end) || 
               (date >= now && date <= fiveMinutesFromNow);
      });
      setIsWithinAllowedDates(isValid);
    }
  }, [date, supervisionDates]);

  const fetchSupervisionDates = async () => {
    setDatesLoading(true);
    try {
      const response = await api.request('/supervision-dates', 'GET');
      setSupervisionDates(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching supervision dates:", error);
      setSupervisionDates([]);
    } finally {
      setDatesLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.request('/supervisions/supervisor', 'GET');
      if (response) {
        setStudents(response.map(supervision => ({
          id: supervision.student._id,
          name: supervision.student.name,
          email: supervision.student.email,
          supervisionId: supervision._id,
          status: supervision.status,
          scheduledDate: supervision.start
        })));
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
    try {
      if (!selectedStudent) {
        throw new Error("Please select a student");
      }

      const payload = {
        studentId: selectedStudent.id,
        date: date.toISOString(),
        isEmergency: !supervisionDates.some(range => {
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);
          return date >= start && date <= end;
        })
      };

      const response = await api.request('/supervisions/set-date', 'POST', payload);
      
      if (response) {
        Alert.alert(
          "Success",
          `Supervision set for ${selectedStudent.name} on ${date.toLocaleString()}`,
          [{ text: "OK", onPress: () => {
            fetchStudents();
            fetchSupervisionDates();
          }}]
        );
      }
    } catch (error) {
      console.error("Error setting supervision:", error);
      Alert.alert(
        "Error", 
        error.message || "Failed to set supervision. Please try again."
      );
    }
  };

  const handleIncomingCall = (callData) => {
    Alert.alert(
      "Incoming Supervision Call",
      `Supervision session with ${callData.callData.student?.name || 'a student'} is starting now.`,
      [
        { text: "Decline", style: "cancel" },
        { 
          text: "Join Call", 
          onPress: () => router.push({
            pathname: '/call',
            params: {
              callId: callData.callId,
              otherUser: JSON.stringify(callData.callData.student),
              isIncoming: 'true',
              supervisionId: callData.supervisionId
            }
          })
        }
      ]
    );
  };

  const formatDateRange = (start, end) => {
    const startStr = new Date(start).toLocaleString();
    const endStr = new Date(end).toLocaleTimeString();
    return `${startStr} - ${endStr}`;
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#874147]">
      <ScrollView className="flex-1 p-6">
        <View className="mb-8">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-white">Supervision Schedule</Text>
            <View style={{ width: 24 }} />
          </View>
          <Text className="text-lg text-white mt-2">
            Manage student supervisions within allowed dates
          </Text>
        </View>

        <View className="mb-4">
          <Text className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
          </Text>
        </View>

        {datesLoading ? (
          <ActivityIndicator size="small" color="#1b583c" />
        ) : supervisionDates.length > 0 ? (
          <View className="bg-white p-4 rounded-lg mb-6">
            <Text className="text-lg font-bold text-[#1b583c] mb-2">Allowed Supervision Periods</Text>
            {supervisionDates.map((period, index) => (
              <View key={index} className="mb-2 pb-2 border-b border-gray-200">
                <Text className="text-[#1b583c]">
                  {formatDateRange(period.startDate, period.endDate)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white p-4 rounded-lg mb-6">
            <Text className="text-gray-700">No scheduled supervision periods available.</Text>
          </View>
        )}

        <View className="bg-white p-4 rounded-lg mb-6">
          <Text className="text-lg font-bold mb-2">Select Student</Text>
          <ScrollView className="max-h-60">
            {students.length > 0 ? (
              students.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  className={`p-3 mb-2 border rounded-md ${
                    selectedStudent?.id === student.id ? 'bg-[#1b583c] border-[#1b583c]' : 'bg-white border-gray-300'
                  }`}
                  onPress={() => setSelectedStudent(student)}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className={`font-medium ${selectedStudent?.id === student.id ? 'text-white' : 'text-gray-800'}`}>
                        {student.name}
                      </Text>
                      <Text className={`text-sm ${selectedStudent?.id === student.id ? 'text-gray-200' : 'text-gray-500'}`}>
                        {student.email}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View 
                        className={`h-3 w-3 rounded-full mr-2 ${
                          student.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} 
                      />
                      <Text className={`text-xs ${selectedStudent?.id === student.id ? 'text-gray-200' : 'text-gray-500'}`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  {student.scheduledDate && (
                    <View className="mt-2">
                      <Text className={`text-xs ${selectedStudent?.id === student.id ? 'text-gray-200' : 'text-gray-500'}`}>
                        Next Session: {new Date(student.scheduledDate).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-gray-500 italic">No students found.</Text>
            )}
          </ScrollView>
        </View>

        <View className="bg-white p-4 rounded-lg mb-6">
          <Text className="text-lg font-bold mb-2">Schedule Session</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Select Date & Time</Text>
            <TouchableOpacity 
              className="flex-row justify-between items-center p-3 border border-gray-300 rounded-md"
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date.toLocaleString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="gray" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                is24Hour={true}
                onChange={handleDateChange}
              />
            )}
            
            {!isWithinAllowedDates && (
              <Text className="text-red-500 text-xs mt-1">
                Warning: This time is outside the scheduled supervision periods.
                It will be marked as an emergency supervision.
              </Text>
            )}
          </View>

          <TouchableOpacity
            className={`p-4 rounded-md ${
              selectedStudent ? 'bg-[#1b583c]' : 'bg-gray-300'
            }`}
            disabled={!selectedStudent}
            onPress={handleSetSupervision}
          >
            <Text className="text-white text-center font-medium">
              Schedule Supervision
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-4 rounded-lg mb-10">
          <Text className="text-lg font-bold mb-4">Actions</Text>
          
          {/* Using the CallButton component instead of the inline button */}
          <CallButton 
            student={selectedStudent}
            disabled={!selectedStudent}
            className="mb-3"
          />
          
          {/* <TouchableOpacity
            className={`flex-row items-center justify-center p-4 rounded-md ${
              selectedStudent ? 'bg-green-500' : 'bg-gray-300'
            }`}
            disabled={!selectedStudent}
            onPress={() => {
              if (selectedStudent) {
                router.push({
                  pathname: '/chat',
                  params: { 
                    studentId: selectedStudent.id,
                    studentName: selectedStudent.name
                  }
                });
              }
            }}
          >
            <Ionicons name="chatbubbles" size={24} color="white" className="mr-2" />
            <Text className="text-white text-center font-medium ml-2">
              Send Message
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupervisorSchedule;