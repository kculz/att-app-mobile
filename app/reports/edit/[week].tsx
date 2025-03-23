import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi'; // Adjust path if needed
import useGetToken from '@/hooks/useGetToken'; // Adjust path if needed
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper'; // For better text input styling
import DateTimePicker from '@react-native-community/datetimepicker';

const getDefaultDates = () => {
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 4); // Default: 5-day workweek

  return {
    startDate: today.toISOString().split('T')[0], // YYYY-MM-DD
    endDate: endDate.toISOString().split('T')[0], // YYYY-MM-DD
  };
};

const EditWeeklyReport = () => {
  const router = useRouter();
  const { week } = useLocalSearchParams();
  const { token, loading: tokenLoading } = useGetToken();
  const { data, error, loading, request } = useApi(token);

  // Separate state variables for text inputs
  const [summary, setSummary] = useState('');
  const [challenges, setChallenges] = useState('');
  const [achievements, setAchievements] = useState('');
  const [workingDays, setWorkingDays] = useState([getDefaultDates()]);
  const [offDaysOrHoliday, setOffDaysOrHoliday] = useState([]);
  const [status, setStatus] = useState('Pending-Review');

  const [saving, setSaving] = useState(false);
  const [isNewReport, setIsNewReport] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState(null);
  const [dateType, setDateType] = useState('startDate'); // Tracks whether startDate or endDate is being changed

  useEffect(() => {
    if (token) {
      fetchReport();
    }
  }, [token]);

  const fetchReport = async () => {
    try {
      const response = await request(`/report/weekly/${week}`, 'GET');
  
      if (response) {
        console.log("API response:", JSON.stringify(response, null, 2));
        
        // Extracting tasks correctly from the array
        const taskData = response.tasks.length > 0 ? response.tasks[0] : { summary: '', challenges: '', achievements: '' };
  
        setSummary(taskData.summary || '');
        setChallenges(taskData.challenges || '');
        setAchievements(taskData.achievements || '');
        setWorkingDays(response.workingDays?.length ? response.workingDays : [getDefaultDates()]);
        setOffDaysOrHoliday(response.offDaysOrHoliday || []);
        setStatus(response.status || 'Pending-Review');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
  
      if (err.response?.status === 404) {
        console.log('Report does not exist, creating a new one.');
        setIsNewReport(true);
      }
    }
  };
  

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = 'POST';
      const endpoint = `/report/create-or-update/${week}`;

      // Construct report data from individual state variables
      const reportData = {
        tasks: {
          summary,
          challenges,
          achievements,
        },
        workingDays,
        offDaysOrHoliday,
        status,
      };

      console.log("Saving data:", JSON.stringify(reportData, null, 2));

      const response = await request(endpoint, method, reportData);

      if (response) {
        console.log('Report saved successfully:', response);
        router.back();
      }
    } catch (err) {
      console.error('Error saving report:', err);
    }
    setSaving(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && selectedDateIndex !== null) {
      const updatedDays = [...workingDays];
      updatedDays[selectedDateIndex][dateType] = selectedDate.toISOString().split('T')[0];
      setWorkingDays(updatedDays);
    }
  };

  const addWorkingDays = () => {
    setWorkingDays([...workingDays, getDefaultDates()]);
  };

  if (tokenLoading || loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Edit Week {week} Report</Text>
          <Text className="text-sm text-gray-500">  Summary: {summary}</Text>
        </View>

        {/* Report Details */}
        <View className="bg-white p-6 rounded-lg shadow-sm">
          {/* Work Summary */}
          <Text className="text-xl font-bold text-gray-900 mb-4">Work Summary</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            value={summary}
            onChangeText={setSummary}
            placeholder="Describe your work summary for this week..."
            className="mb-6"
            theme={{ colors: { primary: '#3B82F6' } }}
          />

          {/* Challenges */}
          <Text className="text-xl font-bold text-gray-900 mb-4">Challenges</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            value={challenges}
            onChangeText={setChallenges}
            placeholder="Describe the challenges you faced this week..."
            className="mb-6"
            theme={{ colors: { primary: '#3B82F6' } }}
          />

          {/* Achievements */}
          <Text className="text-xl font-bold text-gray-900 mb-4">Achievements</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            value={achievements}
            onChangeText={setAchievements}
            placeholder="Describe your achievements for this week..."
            className="mb-6"
            theme={{ colors: { primary: '#3B82F6' } }}
          />

          {/* Working Days Section */}
          <Text className="text-xl font-bold text-gray-900 mb-4">Working Days</Text>
          {workingDays.map((day, index) => (
            <View key={index} className="mb-4">
              <TouchableOpacity
                onPress={() => {
                  setSelectedDateIndex(index);
                  setDateType('startDate');
                  setShowDatePicker(true);
                }}
                className="mb-2 p-3 bg-gray-200 rounded-lg"
              >
                <Text className="text-lg">Start Date: {day.startDate.split('T')[0]}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSelectedDateIndex(index);
                  setDateType('endDate');
                  setShowDatePicker(true);
                }}
                className="p-3 bg-gray-200 rounded-lg"
              >
                <Text className="text-lg">End Date: {day.endDate.split('T')[0]}</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add More Working Days
          <TouchableOpacity
            className="mb-6 p-3 bg-blue-500 rounded-lg flex-row justify-center items-center"
            onPress={addWorkingDays}
          >
            <Text className="text-white font-semibold text-lg">+ Add Working Days</Text>
          </TouchableOpacity> */}

          {/* Date Picker */}
          {showDatePicker && (
            <View style={{ backgroundColor: 'gray', padding: 10, borderRadius: 10 }}>
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
              textColor="black" // Works only for iOS
            />
          </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="mt-8 bg-primary-500 p-4 rounded-lg flex-row justify-center items-center"
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold text-lg">Save Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditWeeklyReport;