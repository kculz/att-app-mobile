import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useApi } from '@/hooks/useApi'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RefreshControl } from 'react-native'
import useGetToken from '@/hooks/useGetToken'

const Dashboard = () => {
    const { token } = useGetToken()
  const router = useRouter()
  const { loading, error, request } = useApi(token)
  const [companies, setCompanies] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchCompanies = async () => {
    try {
      const response = await request('/internship/companies-students', 'GET')
      setCompanies(response)
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchCompanies()
  }

  const handleSetDates = (company) => {
    router.push({
      pathname: '/coordinator/set-dates',
      params: { 
        companyId: company._id || company.id, 
        companyName: company.name,
        currentDates: company.supervisionDates?.join(', ') || ''
      }
    })
  }

  const renderCompanyItem = ({ item }) => (
    <View className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            <Ionicons name="location" size={14} color="#6b7280" /> {item.location}
          </Text>
        </View>
        
      </View>
      
      <View className="border-t border-gray-100 pt-2 mt-2">
        <Text className="text-sm font-medium text-gray-700">
          <Ionicons name="people" size={14} color="#6b7280" /> Students Placed: {item.students?.length || 0}
        </Text>
        {item.students?.length > 0 && (
          <View className="mt-2">
            {item.students.slice(0, 2).map((student, index) => (
              <Text key={index} className="text-sm text-gray-600">
                • {student.name || `Student ${index + 1}`}
              </Text>
            ))}
            {item.students.length > 2 && (
              <Text className="text-sm text-gray-500 mt-1">
                +{item.students.length - 2} more students
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-[#1b583c]">Company Supervision</Text>
        <Text className="text-base text-gray-600">Manage student placements and visits</Text>
      </View>

      <FlatList
        data={companies}
        renderItem={renderCompanyItem}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={{ paddingBottom: 90 }}
        key={item => item._id || item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1b583c']}
            tintColor="#1b583c"
          />
        }
        ListHeaderComponent={
          loading && !refreshing ? (
            <View className="py-4">
              <Text className="text-center text-gray-600">Loading companies...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <View className="py-10 px-4">
              <Text className="text-center text-gray-600">
                {error ? `Error: ${error}` : 'No companies found with student placements'}
              </Text>
              {error && (
                <TouchableOpacity 
                  className="bg-[#1b583c] px-4 py-2 rounded-md mt-4 mx-auto"
                  onPress={fetchCompanies}
                >
                  <Text className="text-white font-medium">Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />

      {/* Floating action button for setting dates */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-[#1b583c] w-14 h-14 rounded-full justify-center items-center shadow-lg"
        onPress={() => router.push('/coordinator/set-dates')}
      >
        <Ionicons name="calendar" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Dashboard