import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';

const InternshipDetails = () => {
  const router = useRouter();
  const { token, loading: tokenLoading } = useGetToken();
  const { data, error, loading, request } = useApi(token);

  const [companyDetails, setCompanyDetails] = useState({
    name: '',
    address: '',
    contact: '',
  });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)); // Default to 90 days later
  const [supervisor, setSupervisor] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [hasInternship, setHasInternship] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInternshipDetails();
    }
  }, [token]);

  const fetchInternshipDetails = async () => {
    try {
      const responseData = await request('/internship/details', 'GET');
      
      if (responseData === "No internship found for this student." || !responseData) {
        setHasInternship(false);
      } else {
        setHasInternship(true);
        
        // Update state with fetched data
        if (responseData) {
          setCompanyDetails({
            name: responseData.companyName || '',
            address: responseData.companyAddress || '',
            contact: responseData.companyContact || '',
          });
          setStartDate(responseData.startDate ? new Date(responseData.startDate) : new Date());
          setEndDate(responseData.endDate ? new Date(responseData.endDate) : new Date());
          setSupervisor(responseData.supervisor || { name: '', email: '', phone: '' });
        }
      }
    } catch (err) {
      console.error("Error fetching internship details:", err);
      setHasInternship(false);
    }
  };

  // Handle date change
  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const saveInternshipDetails = async () => {
    try {
      const payload = {
        startDate,
        endDate,
        companyName: companyDetails.name,
        companyAddress: companyDetails.address,
        companyContact: companyDetails.contact,
      };

      // Choose endpoint based on whether we're creating or updating
      const endpoint = hasInternship ? '/internship/update' : '/internship/create';
      const method = hasInternship ? 'PATCH' : 'POST';
      
      console.log(`${hasInternship ? 'Updating' : 'Creating'} internship details...`);
      
      const responseData = await request(endpoint, method, payload);
      
      if ((hasInternship && responseData?.msg === "Internship updated successfully!") || 
          (!hasInternship && responseData?.chat !== null)) {
        
        console.log(`Internship ${hasInternship ? 'updated' : 'created'} successfully`);
        
        // Get the internship data from the response
        const internshipData = hasInternship ? responseData.internship : responseData.internship;
        
        // Update state with the internship details
        if (internshipData) {
          setCompanyDetails({
            name: internshipData.companyName || '',
            address: internshipData.companyAddress || '',
            contact: internshipData.companyContact || '',
          });
          setStartDate(internshipData.startDate ? new Date(internshipData.startDate) : new Date());
          setEndDate(internshipData.endDate ? new Date(internshipData.endDate) : new Date());
          setSupervisor(internshipData.supervisor || { name: '', email: '', phone: '' });
        }
        
        setHasInternship(true);
        setModalVisible(false);
      } else {
        console.error(`Failed to ${hasInternship ? 'update' : 'create'} internship details`);
      }
    } catch (err) {
      console.error(`Failed to ${hasInternship ? 'update' : 'create'} internship details:`, err);
    }
  };

  if (tokenLoading || loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView className="flex-1 p-5">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Internship Details</Text>
          <Text className="text-base text-gray-600 mt-1">
            {hasInternship ? 'View and manage your internship information' : 'Add your internship information to get started'}
          </Text>
        </View>

        {!hasInternship ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="briefcase-outline" size={72} color="#3B82F6" />
            <Text className="text-lg text-gray-700 text-center mt-4 mb-8">
              No internship details found. Please add your internship information.
            </Text>
            <TouchableOpacity
              className="bg-[#1b583c] px-8 py-4 rounded-xl w-full"
              onPress={() => setModalVisible(true)}>
              <Text className="text-white text-center font-bold text-lg">Add Internship Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Action button for existing internship */}
            <View className="mb-6">
              <TouchableOpacity
                className="bg-[#1b583c] px-6 py-3 rounded-xl flex-row items-center justify-center"
                onPress={() => setModalVisible(true)}>
                <Ionicons name="create-outline" size={20} color="white" />
                <Text className="text-white text-center font-bold text-base ml-2">Edit Internship Details</Text>
              </TouchableOpacity>
            </View>

            {/* Company Details Card */}
            <View className="bg-gray-50 p-5 rounded-xl shadow-sm mb-5 border border-gray-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-900">Company Details</Text>
                <Ionicons name="business-outline" size={22} color="#3B82F6" />
              </View>

              <View className="space-y-3">
                <View>
                  <Text className="text-sm text-gray-500 mb-1">Company Name</Text>
                  <Text className="text-base text-gray-900 font-medium">{companyDetails.name || 'Not specified'}</Text>
                </View>
                
                <View>
                  <Text className="text-sm text-gray-500 mb-1">Address</Text>
                  <Text className="text-base text-gray-900 font-medium">{companyDetails.address || 'Not specified'}</Text>
                </View>
                
                <View>
                  <Text className="text-sm text-gray-500 mb-1">Contact</Text>
                  <Text className="text-base text-gray-900 font-medium">{companyDetails.contact || 'Not specified'}</Text>
                </View>
              </View>
            </View>

            {/* Internship Dates Card */}
            <View className="bg-gray-50 p-5 rounded-xl shadow-sm mb-5 border border-gray-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-900">Internship Duration</Text>
                <Ionicons name="calendar-outline" size={22} color="#3B82F6" />
              </View>

              <View className="space-y-3">
                <View>
                  <Text className="text-sm text-gray-500 mb-1">Start Date</Text>
                  <Text className="text-base text-gray-900 font-medium">{startDate.toLocaleDateString()}</Text>
                </View>
                
                <View>
                  <Text className="text-sm text-gray-500 mb-1">End Date</Text>
                  <Text className="text-base text-gray-900 font-medium">{endDate.toLocaleDateString()}</Text>
                </View>
                
                <View>
                  <Text className="text-sm text-gray-500 mb-1">Duration</Text>
                  <Text className="text-base text-gray-900 font-medium">
                    {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days
                  </Text>
                </View>
              </View>
            </View>

            {/* Supervisor Details Card */}
            <View className="bg-gray-50 p-5 rounded-xl shadow-sm mb-5 border border-gray-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-900">Supervisor Information</Text>
                <Ionicons name="person-outline" size={22} color="#3B82F6" />
              </View>

              <View className="space-y-3">
                <View>
                  <Text className="text-sm text-gray-500 mb-1">Name</Text>
                  <Text className="text-base text-gray-900 font-medium">{supervisor.name || 'Not assigned yet'}</Text>
                </View>
                
                <View>
                  <Text className="text-sm text-gray-500 mb-1">Email</Text>
                  <Text className="text-base text-gray-900 font-medium">{supervisor.email || 'Not available'}</Text>
                </View>
                
                <View>
                  <Text className="text-sm text-gray-500 mb-1">Phone</Text>
                  <Text className="text-base text-gray-900 font-medium">{supervisor.phone || 'Not available'}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Date pickers - shown conditionally */}
        {showStartDatePicker && (
          <DateTimePicker
            testID="startDatePicker"
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}

        {/* Modal for creating or editing internship details */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-h-5/6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">
                  {hasInternship ? 'Edit Internship Details' : 'Add Internship Details'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle-outline" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView className="max-h-96">
                <View className="space-y-5">
                  {/* Company section */}
                  <View>
                    <Text className="text-lg font-semibold text-gray-800 mb-3">Company Information</Text>
                    
                    <TextInput
                      className="bg-gray-100 p-4 rounded-lg border border-gray-300 mb-3"
                      placeholder="Company Name (e.g., ABC Corporation)"
                      placeholderTextColor="#9CA3AF"
                      value={companyDetails.name}
                      onChangeText={(text) => setCompanyDetails({ ...companyDetails, name: text })}
                    />
                    
                    <TextInput
                      className="bg-gray-100 p-4 rounded-lg border border-gray-300 mb-3"
                      placeholder="Company Address (e.g., 123 Business St, City)"
                      placeholderTextColor="#9CA3AF"
                      value={companyDetails.address}
                      onChangeText={(text) => setCompanyDetails({ ...companyDetails, address: text })}
                      multiline={true}
                      numberOfLines={2}
                    />
                    
                    <TextInput
                      className="bg-gray-100 p-4 rounded-lg border border-gray-300"
                      placeholder="Contact Information (e.g., 555-123-4567)"
                      placeholderTextColor="#9CA3AF"
                      value={companyDetails.contact}
                      onChangeText={(text) => setCompanyDetails({ ...companyDetails, contact: text })}
                    />
                  </View>

                  {/* Date section */}
                  <View>
                    <Text className="text-lg font-semibold text-gray-800 mb-3">Internship Period</Text>
                    
                    <TouchableOpacity
                      className="bg-gray-100 p-4 rounded-lg border border-gray-300 mb-3 flex-row justify-between items-center"
                      onPress={() => setShowStartDatePicker(true)}>
                      <Text className={companyDetails.name ? "text-gray-900" : "text-gray-500"}>
                        {startDate.toLocaleDateString()}
                      </Text>
                      <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-gray-100 p-4 rounded-lg border border-gray-300 flex-row justify-between items-center"
                      onPress={() => setShowEndDatePicker(true)}>
                      <Text className={companyDetails.name ? "text-gray-900" : "text-gray-500"}>
                        {endDate.toLocaleDateString()}
                      </Text>
                      <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View className="mt-6 space-y-3">
                <TouchableOpacity
                  className="bg-[#1b583c] p-4 rounded-xl"
                  onPress={saveInternshipDetails}>
                  <Text className="text-white text-center font-bold text-lg">
                    {hasInternship ? 'Update Details' : 'Save Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InternshipDetails;