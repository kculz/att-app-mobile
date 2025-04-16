import React from 'react';
import { TouchableOpacity, Text, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWebSocketContext } from '@/context/WebSocketContext';

const CallButton = ({ 
  student, 
  disabled = false,
  className = '',
  iconSize = 24,
  showLabel = true,
  onCallInitiated = () => {} 
}) => {
  const router = useRouter();
  const { isConnected, initiateCall } = useWebSocketContext();
  const [calling, setCalling] = React.useState(false);

  const handleStartVideoCall = async () => {
    if (!student) {
      Alert.alert("Error", "No student selected");
      return;
    }

    if (!isConnected) {
      Alert.alert(
        "Connection Error", 
        "You're not connected to the real-time service. Please check your connection and try again."
      );
      return;
    }

    try {
      setCalling(true);
      
      // Use the WebSocket context to initiate the call
      const callId = initiateCall(student.id, {
        _id: student.id,
        name: student.name
      }, student.supervisionId);
      
      // Callback to parent component if needed
      onCallInitiated(callId);
      
      // Navigate to the call screen
      router.push({
        pathname: '/call',
        params: {
          callId,
          otherUser: JSON.stringify({
            _id: student.id,
            name: student.name
          }),
          isIncoming: 'false',
          supervisionId: student.supervisionId
        }
      });
    } catch (error) {
      console.error("Error starting video call:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to start video call. Please try again."
      );
    } finally {
      setCalling(false);
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center p-4 rounded-md ${
        !disabled ? 'bg-blue-500' : 'bg-gray-300'
      } ${className}`}
      disabled={disabled || calling || !isConnected}
      onPress={handleStartVideoCall}
      activeOpacity={0.7}
    >
      {calling ? (
        <ActivityIndicator size="small" color="white" style={{ marginRight: showLabel ? 8 : 0 }} />
      ) : (
        <Ionicons 
          name="videocam" 
          size={iconSize} 
          color="white" 
          style={{ marginRight: showLabel ? 8 : 0 }} 
        />
      )}
      
      {showLabel && (
        <Text className="text-white text-center font-medium">
          {calling ? "Connecting..." : "Start Video Call Now"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CallButton;