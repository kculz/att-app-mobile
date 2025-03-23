import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi'; // Adjust the import path as needed
import useGetToken from '@/hooks/useGetToken'; // Adjust the import path as needed

const ReportsScreen = () => {
  const router = useRouter();
  const { token, loading: tokenLoading } = useGetToken();
  const { data, error, loading, request } = useApi(token);

  const [weeklyReports, setWeeklyReports] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [weeksCompleted, setWeeksCompleted] = useState(0);
  const [weeksLeft, setWeeksLeft] = useState(0);

  // Fetch weekly reports when the component mounts
  useEffect(() => {
    if (token) {
      fetchWeeklyReports();
    }
  }, [token]);

  // Check if a date is valid
  const isValidDate = (date) => {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  };

  // Safely create date objects
  const createSafeDate = (dateValue, fallback = new Date()) => {
    if (!dateValue) return new Date(fallback);
    
    try {
      const d = new Date(dateValue);
      return isNaN(d.getTime()) ? new Date(fallback) : d;
    } catch (e) {
      return new Date(fallback);
    }
  };

  // Format date in a locale-friendly way
  const formatDate = (date) => {
    const d = createSafeDate(date);
    return d.toLocaleDateString();
  };

  const fetchWeeklyReports = async () => {
    try {
      const response = await request('/report/weekly', 'GET');
      
      if (!response || !Array.isArray(response.weeklyReports)) {
        throw new Error("Invalid response from backend");
      }
  
      const currentDate = new Date();
      let weeks = response.weeklyReports.map(report => {
        const startDate = createSafeDate(report.startDate);
        const endDate = createSafeDate(report.endDate, startDate);
  
        const status = report.status || 'Waiting';
        return { ...report, startDate, endDate, status };
      });
  
      // Sort weeks in ascending order by startDate
      weeks.sort((a, b) => a.startDate - b.startDate);
  
      // Filter to only current and previous week
      const currentWeek = weeks.find(w => currentDate >= w.startDate && currentDate <= w.endDate);
      const prevWeekIndex = weeks.findIndex(w => w.weekNumber === currentWeek?.weekNumber) - 1;
      const prevWeek = prevWeekIndex >= 0 ? weeks[prevWeekIndex] : null;
  
      const filteredWeeks = prevWeek ? [prevWeek, currentWeek] : [currentWeek];
  
      setWeeklyReports(filteredWeeks);
    } catch (err) {
      console.error("Error fetching weekly reports:", err);
      Alert.alert("Error", "Failed to fetch weekly reports");
    }
  };
  
  const isReportEditable = (report) => {
    const currentDate = new Date();
    const reportStartDate = createSafeDate(report.startDate);
    
    // Allow editing for current or past weeks (not upcoming weeks)
    return reportStartDate <= currentDate;
  };
  
  

  // Generate working days (Mon-Fri) between two dates
  const generateWorkingDays = (startDate, endDate) => {
    const days = [];
    try {
      const current = createSafeDate(startDate);
      const end = createSafeDate(endDate);
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        // 0 is Sunday, 6 is Saturday - so we want 1-5 (Mon-Fri)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          days.push({
            startDate: new Date(current),
            endDate: new Date(current)
          });
        }
        current.setDate(current.getDate() + 1);
      }
    } catch (err) {
      console.error("Error generating working days:", err);
    }
    
    return days;
  };

  // Calculate progress (total weeks, weeks completed, weeks left)
  const calculateProgress = (reports) => {
    try {
      const currentDate = new Date();
      const totalWeeks = reports.length;
      const weeksCompleted = reports.filter(
        (report) => createSafeDate(report.endDate) < currentDate
      ).length;
      const weeksLeft = totalWeeks - weeksCompleted;

      setTotalWeeks(totalWeeks);
      setWeeksCompleted(weeksCompleted);
      setWeeksLeft(weeksLeft);

      // Find the index of the current week
      const currentWeekIndex = reports.findIndex(
        (report) => {
          const startDate = createSafeDate(report.startDate);
          const endDate = createSafeDate(report.endDate);
          return currentDate >= startDate && currentDate <= endDate;
        }
      );
      
      // If current week found, set it, otherwise default to the last week
      if (currentWeekIndex !== -1) {
        setCurrentWeekIndex(currentWeekIndex);
        setVisibleStartIndex(Math.max(0, currentWeekIndex - 2));
      } else {
        setCurrentWeekIndex(reports.length - 1);
        setVisibleStartIndex(Math.max(0, reports.length - 5));
      }
    } catch (err) {
      console.error("Error calculating progress:", err);
    }
  };

  // Handle setting holidays
  const handleSetHolidays = async (holidays) => {
    try {
      const response = await request('/report/holidays', 'POST', { holidays });
      if (response) {
        console.log("Holidays set successfully:", response);
        fetchWeeklyReports(); // Refresh the weekly reports
      }
    } catch (err) {
      console.error("Error setting holidays:", err);
      Alert.alert("Error", "Failed to set holidays");
    }
  };

  // Handle navigation to previous set of weeks
  const handlePreviousWeeks = () => {
    if (visibleStartIndex > 0) {
      setVisibleStartIndex(Math.max(0, visibleStartIndex - 5));
    }
  };

  // Handle navigation to next set of weeks
  const handleNextWeeks = () => {
    if (visibleStartIndex + 5 < weeklyReports.length) {
      setVisibleStartIndex(visibleStartIndex + 5);
    }
  };

  // Get visible reports based on current index
  const visibleReports = weeklyReports.slice(
    visibleStartIndex,
    Math.min(visibleStartIndex + 5, weeklyReports.length)
  );



  // Get status tag color based on status
  const getStatusTagColor = (status) => {
    switch (status) {
      case 'Upcoming':
        return { bg: 'bg-gray-100', text: 'text-gray-500' };
      case 'Waiting':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'Pending-Review':
        return { bg: 'bg-orange-100', text: 'text-orange-700' };
      case 'Submitted':
      case 'Reviewed':
        return { bg: 'bg-green-100', text: 'text-green-700' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-500' };
    }
  };

  if (tokenLoading || loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView className="h-full bg-gray-50">
        {/* Header */}
        <View className="mb-8 bg-white p-6 shadow-sm">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="text-3xl font-bold text-gray-900">Weekly Reports</Text>
            {/* <TouchableOpacity
              className="bg-blue-500 p-3 rounded-lg flex-row items-center"
              onPress={() => router.push('/student/set-holidays')}
            >
              <Ionicons name="calendar" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Set Holidays</Text>
            </TouchableOpacity> */}
          </View>

          {/* Progress Bar */}
            {/* <View className="bg-gray-200 rounded-full h-4">
              <View
                className="bg-blue-500 rounded-full h-4"
                style={{ width: `${(weeksCompleted / totalWeeks) * 100}%` }}
              />
            </View> */}

            <Text className="text-gray-600 mt-2">
              {weeksCompleted} / {totalWeeks} weeks completed ({weeksLeft} weeks left)
            </Text>
        </View>


        {/* Pagination */}
        <View className="flex flex-row justify-between items-center mx-4 mb-6">
          <TouchableOpacity
            className={`p-3 rounded-lg ${visibleStartIndex > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
            onPress={handlePreviousWeeks}
            disabled={visibleStartIndex === 0}
          >
            <Text className={`font-semibold ${visibleStartIndex > 0 ? 'text-white' : 'text-gray-500'}`}>Previous</Text>
          </TouchableOpacity>
          
          {weeklyReports.length > 0 && (
            <Text className="text-gray-600">
              Weeks {visibleReports[0]?.weekNumber || 0} - {visibleReports[visibleReports.length - 1]?.weekNumber || 0}
            </Text>
          )}
          
          <TouchableOpacity
            className={`p-3 rounded-lg ${visibleStartIndex + 5 < weeklyReports.length ? 'bg-blue-500' : 'bg-gray-300'}`}
            onPress={handleNextWeeks}
            disabled={visibleStartIndex + 5 >= weeklyReports.length}
          >
            <Text className={`font-semibold ${visibleStartIndex + 5 < weeklyReports.length ? 'text-white' : 'text-gray-500'}`}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Reports List */}
        <View className="px-4 space-y-4 mb-6">
          {visibleReports.length > 0 ? (
            visibleReports.map((report, index) => {
              const reportStartDate = createSafeDate(report?.startDate);
              const reportEndDate = createSafeDate(report?.endDate);
              const currentDate = new Date();
              
              const isCurrentWeek = 
                currentDate >= reportStartDate && 
                currentDate <= reportEndDate;
                
              const isPastWeek = reportEndDate < currentDate;
              const isFutureWeek = reportStartDate > currentDate;
              
              // Get status tag color
              const statusColor = getStatusTagColor(report?.status);
              
              return (
                <View
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-sm"
                >
                  <View className="flex flex-row justify-between items-center">
                    <Text className="text-xl font-bold text-gray-900">
                      Week {report?.weekNumber}
                    </Text>
                    <View className={`${statusColor.bg} px-3 py-1 rounded-full`}>
                      <Text className={`${statusColor.text} font-semibold`}>{report?.status}</Text>
                    </View>
                  </View>

                  <View className="text-gray-600 mt-2">
                    <Text className="text-gray-600">
                      {report?.workingDays?.length > 0 
                        ? `${formatDate(report?.workingDays[0]?.startDate)} - ${formatDate(report?.workingDays[report?.workingDays.length - 1].endDate)}`
                        : `${formatDate(new Date())} - ${formatDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000))}`
                      }
                    </Text>
                  </View>

                  <Text className="text-gray-600 mt-2">
                    Working Days: {report?.workingDays?.length || 0} days
                  </Text>

                  {isReportEditable(report) && (
                    <TouchableOpacity
                      className="mt-4 bg-blue-500 p-3 rounded-lg flex-row items-center justify-center"
                      onPress={() => router.push(`/reports/edit/${report?.weekNumber}`)}
                    >
                      <Ionicons name="pencil" size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">
                        {isPastWeek ? "View & Edit" : "Fill Report"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <View className="bg-white p-6 rounded-2xl shadow-sm items-center">
              <Text className="text-lg text-gray-600">No weekly reports available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportsScreen;