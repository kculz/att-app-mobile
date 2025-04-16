import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '@/hooks/useApi';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio, Video  } from 'expo-av';
import { CameraView } from 'expo-camera';
import { useWebSocketContext } from '@/context/WebSocketContext';

const CallScreen = () => {
  const router = useRouter();
  const api = useApi();
  const params = useLocalSearchParams();
  const { isConnected, sendMessage, joinCall, endCall, onMessage } = useWebSocketContext();

  const {
    supervisionId = '',
    otherUser = '{}',
    isIncoming = 'false',
    callId = ''
  } = params;

  const parsedOtherUser = JSON.parse(otherUser as string);
  const parsedIsIncoming = isIncoming === 'true';

  const [callStatus, setCallStatus] = useState(parsedIsIncoming ? 'ringing' : 'connecting');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const [remoteUserLeft, setRemoteUserLeft] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef(null);

  // Request camera/audio permissions
  useEffect(() => {
    (async () => {
      const { Camera } = await import('expo-camera');
      const { status } = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted' && audioStatus.status === 'granted');
    })();
  }, []);

  // Listen for WebSocket events
  useEffect(() => {
    const handleIncoming = (msg: any) => {
      if (msg.type === 'call_ended' && msg.callId === callId) {
        setRemoteUserLeft(true);
        router.back();
      }
    };

    onMessage(handleIncoming);

    return () => {
      onMessage(null); // clean up
    };
  }, [callId]);

  // Update connection status
  useEffect(() => {
    if (!isConnected) {
      setCallStatus('connecting');
    }
  }, [isConnected]);

  // Handle joining
  useEffect(() => {
    if (isConnected && callId && !parsedIsIncoming) {
      joinCallSession();
    }
  }, [isConnected]);

  // Timer
  useEffect(() => {
    if (callStatus === 'connected') {
      startCallTimer();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const joinCallSession = async () => {
    try {
      setCallStatus('connecting');
      joinCall(callId as string);

      sendMessage({
        type: 'user_joined',
        recipientId: parsedOtherUser._id,
        callId
      });

      setCallStatus('connected');
      startCallTimer();
    } catch (error) {
      console.error("Error joining call:", error);
      setCallStatus('failed');
    }
  };

  const handleEndCall = () => {
    endCall(callId as string);
    sendMessage({
      type: 'call_ended',
      recipientId: parsedOtherUser._id,
      callId
    });
    router.back();
  };

  const handleCancelCall = () => {
    endCall(callId as string);
    router.back();
  };

  const toggleMute = async () => {
    try {
      if (isMuted) {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true });
      } else {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const flipCamera = () => {
    setCameraType(prev => (prev === 'front' ? 'back' : 'front'));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStatusScreen = () => {
    switch(callStatus) {
      case 'ringing':
        return (
          <View className="flex-1 bg-black justify-center items-center">
            <Text className="text-white text-2xl font-bold mb-2">{parsedOtherUser.name}</Text>
            <Text className="text-gray-300 text-lg mb-10">Incoming Video Call</Text>
            <View className="flex-row justify-around w-full px-10">
              <TouchableOpacity className="items-center" onPress={() => router.back()}>
                <View className="bg-red-500 p-4 rounded-full w-16 h-16 items-center justify-center">
                  <Ionicons name="close" size={30} color="white" />
                </View>
                <Text className="text-white mt-2">Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center" onPress={joinCallSession}>
                <View className="bg-green-500 p-4 rounded-full w-16 h-16 items-center justify-center">
                  <Ionicons name="videocam" size={30} color="white" />
                </View>
                <Text className="text-white mt-2">Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'connecting':
        return (
          <View className="flex-1 bg-black justify-center items-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-white text-xl mt-4 mb-6">Connecting to {parsedOtherUser.name}...</Text>
            <TouchableOpacity className="bg-red-500 px-6 py-3 rounded-lg" onPress={handleCancelCall}>
              <Text className="text-white font-medium">Cancel Call</Text>
            </TouchableOpacity>
          </View>
        );

      case 'failed':
        return (
          <View className="flex-1 bg-black justify-center items-center">
            <View className="bg-red-500 rounded-full p-5 mb-6">
              <Ionicons name="alert-circle" size={40} color="white" />
            </View>
            <Text className="text-white text-xl mb-2">Call Failed</Text>
            <Text className="text-gray-300 text-center mb-8">
              Could not connect to {parsedOtherUser.name}
            </Text>
            <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg" onPress={() => router.back()}>
              <Text className="text-white font-medium">Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-green-500 px-6 py-3 rounded-lg mt-4" onPress={joinCallSession}>
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        );

      case 'connected':
        return (
          <View className="flex-1 bg-black">
            {/* Simulated Remote Camera View */}
            <View className="flex-1 bg-gray-900 justify-center items-center">
              <Text className="text-white text-xl mb-2">Connected with {parsedOtherUser.name}</Text>
              <Text className="text-gray-300 mb-4">{formatTime(elapsedTime)}</Text>
              <View className="bg-gray-700 w-5/6 h-1/2 justify-center items-center rounded-lg overflow-hidden">
                <Text className="text-white">Remote User Video</Text>
              </View>
              {hasPermission && isCameraOn && (
                <View className="absolute bottom-32 right-4 w-32 h-48 border-2 border-white rounded overflow-hidden">
                  <CameraView
                    ref={cameraRef}
                    className="flex-1"
                    facing={cameraType}
                  />
                </View>
              )}
            </View>

            <View className="absolute bottom-20 w-full">
              <Text className="text-white text-center mb-4">{formatTime(elapsedTime)}</Text>
              <View className="flex-row justify-around px-10">
                <TouchableOpacity className="items-center" onPress={toggleMute}>
                  <View className={`${isMuted ? 'bg-red-500' : 'bg-gray-700'} p-4 rounded-full w-14 h-14 items-center justify-center`}>
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="white" />
                  </View>
                  <Text className="text-white mt-2">{isMuted ? 'Unmute' : 'Mute'}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center" onPress={handleEndCall}>
                  <View className="bg-red-500 p-4 rounded-full w-14 h-14 items-center justify-center">
                    <Ionicons name="call" size={24} color="white" />
                  </View>
                  <Text className="text-white mt-2">End</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center" onPress={toggleCamera}>
                  <View className={`${isCameraOn ? 'bg-gray-700' : 'bg-red-500'} p-4 rounded-full w-14 h-14 items-center justify-center`}>
                    <Ionicons name={isCameraOn ? "videocam" : "videocam-off"} size={24} color="white" />
                  </View>
                  <Text className="text-white mt-2">{isCameraOn ? 'Camera Off' : 'Camera On'}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center" onPress={flipCamera}>
                  <View className="bg-gray-700 p-4 rounded-full w-14 h-14 items-center justify-center">
                    <Ionicons name="camera-reverse" size={24} color="white" />
                  </View>
                  <Text className="text-white mt-2">Flip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
    }
  };

  return renderStatusScreen();
};

export default CallScreen;