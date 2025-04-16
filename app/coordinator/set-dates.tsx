import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useApi } from '@/hooks/useApi'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import useGetToken from '@/hooks/useGetToken'

const SetDates = () => {
  const router = useRouter()

  const { token } = useGetToken();
  const { loading, error, request } = useApi(token)
  
  const [dateRanges, setDateRanges] = useState([])
  const [showPicker, setShowPicker] = useState(null) // 'startDate' or 'endDate'
  const [newDateRange, setNewDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)) // Tomorrow by default
  })

  useEffect(() => {
    const loadDates = async () => {
      try {
        const response = await request('/supervision-dates', 'GET')
        if (response?.data) {
          setDateRanges(response.data.map(range => ({
            startDate: new Date(range.startDate),
            endDate: new Date(range.endDate)
          })))
        }
      } catch (err) {
        console.error('Failed to load dates:', err)
      }
    }
    loadDates()
  }, [])

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(null)
    if (selectedDate) {
      setNewDateRange(prev => ({
        ...prev,
        [showPicker]: selectedDate
      }))
    }
  }

  const addDateRange = () => {
    // Validate date range
    if (newDateRange.endDate <= newDateRange.startDate) {
      Alert.alert('Invalid Date Range', 'End date must be after start date')
      return
    }

    // Check for overlapping dates
    const hasOverlap = dateRanges.some(range => {
      return (
        (newDateRange.startDate >= range.startDate && newDateRange.startDate <= range.endDate) ||
        (newDateRange.endDate >= range.startDate && newDateRange.endDate <= range.endDate) ||
        (newDateRange.startDate <= range.startDate && newDateRange.endDate >= range.endDate)
      )
    })

    if (hasOverlap) {
      Alert.alert('Date Conflict', 'This date range overlaps with an existing range')
      return
    }
    
    setDateRanges([...dateRanges, newDateRange])
    setNewDateRange({
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1))
    })
  }

  const removeDateRange = (index) => {
    const updatedRanges = [...dateRanges]
    updatedRanges.splice(index, 1)
    setDateRanges(updatedRanges)
  }

  const saveDateRanges = async () => {
    try {
      const formattedRanges = dateRanges.map(range => ({
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString()
      }))

      await request('/supervision-dates', 'PUT', {
        dateRanges: formattedRanges
      })

      Alert.alert('Success', 'Global supervision dates updated successfully')
      router.back()
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save date ranges')
    }
  }

  const formatDateRange = (start, end) => {
    const sameYear = start.getFullYear() === end.getFullYear()
    const sameMonth = start.getMonth() === end.getMonth()
    
    const startOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: sameYear ? undefined : 'numeric'
    }
    
    const endOptions = { 
      weekday: 'short', 
      month: sameMonth ? undefined : 'short', 
      day: 'numeric',
      year: 'numeric'
    }

    return `${start.toLocaleDateString(undefined, startOptions)} - ${end.toLocaleDateString(undefined, endOptions)}`
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-[#1b583c]">Set Global Supervision Dates</Text>
          <Text className="text-lg text-gray-700 mt-1">Dates will apply to all companies</Text>
        </View>

        {/* Current Date Ranges List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Scheduled Date Ranges</Text>
          
          {dateRanges.length === 0 ? (
            <Text className="text-gray-500">No date ranges scheduled yet</Text>
          ) : (
            dateRanges.map((range, index) => (
              <View key={index} className="bg-white p-4 rounded-lg mb-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-800 font-medium">
                    {formatDateRange(range.startDate, range.endDate)}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => removeDateRange(index)}
                    className="p-2"
                  >
                    <Ionicons name="trash" size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>
                <Text className="text-gray-500 text-sm mt-1">
                  {Math.ceil((range.endDate - range.startDate) / (1000 * 60 * 60 * 24)) + 1} days
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Add New Date Range Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Add New Date Range</Text>
          
          <View className="bg-white p-4 rounded-lg">
            {/* Start Date */}
            <TouchableOpacity 
              onPress={() => setShowPicker('startDate')}
              className="mb-4"
            >
              <Text className="text-gray-500 text-sm">Start Date</Text>
              <Text className="text-gray-800 text-lg">
                {newDateRange.startDate.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>

            {/* End Date */}
            <TouchableOpacity 
              onPress={() => setShowPicker('endDate')}
              className="mb-4"
            >
              <Text className="text-gray-500 text-sm">End Date</Text>
              <Text className="text-gray-800 text-lg">
                {newDateRange.endDate.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={newDateRange[showPicker]}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={showPicker === 'endDate' ? newDateRange.startDate : new Date()}
              />
            )}

            <TouchableOpacity
              onPress={addDateRange}
              className="bg-[#1b583c] py-3 rounded-lg flex-row justify-center items-center mt-2"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Add Date Range</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={saveDateRanges}
          disabled={loading || dateRanges.length === 0}
          className={`py-3 rounded-lg flex-row justify-center items-center mb-6 ${dateRanges.length === 0 ? 'bg-gray-400' : 'bg-[#874147]'}`}
        >
          {loading ? (
            <Text className="text-white font-medium">Saving...</Text>
          ) : (
            <Text className="text-white font-medium">Save All Date Ranges</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SetDates