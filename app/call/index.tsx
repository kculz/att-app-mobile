// components/SupervisionCallScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useApi } from '@/hooks/useApi';
import useGetToken from '@/hooks/useGetToken';
import { useRouter } from 'expo-router';

const SupervisionCallScreen = ({ route }) => {
  const { supervisionId, otherUser, roomId, isIncoming = false } = route.params;
  const router = useRouter();
  const { token } = useGetToken();
  const api = useApi(token);
  
  const [callStatus, setCallStatus] = useState(isIncoming ? 'ringing' : 'connecting');
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const webViewRef = useRef(null);
  
  useEffect(() => {
    // Join the call on component mount
    if (token && supervisionId) {
      joinCall();
    }
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [token, supervisionId]);
  
  const joinCall = async () => {
    try {
      const response = await api.request(`/supervision-calls/join/${supervisionId}`, 'POST');
      
      if (response && response.success) {
        setCallStatus('connected');
        
        // Start timer
        timerRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
      }
    } catch (error) {
      console.error("Error joining call:", error);
      setCallStatus('failed');
    }
  };
  
  const endCall = async () => {
    try {
      await api.request(`/supervision-calls/end/${supervisionId}`, 'POST');
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Go back to previous screen
      router.back();
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render call ringing UI
  if (callStatus === 'ringing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.callContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            style={styles.callerImage}
          />
          <Text style={styles.callerName}>{otherUser?.name || 'User'}</Text>
          <Text style={styles.callStatus}>Supervision Call</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={30} color="#fff" />
              <Text style={styles.actionText}>Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={joinCall}
            >
              <Ionicons name="videocam" size={30} color="#fff" />
              <Text style={styles.actionText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Render connected call UI
  return (
    <SafeAreaView style={styles.container}>
      {callStatus === 'connected' ? (
        <>
          {/* This would be replaced with your actual WebRTC implementation */}
          <WebView
            ref={webViewRef}
            source={{ uri: `https://yourvideocallserver.example/room/${roomId}?token=${token}` }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
          />
          
          <View style={styles.callControls}>
            <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
            
            <View style={styles.controlButtons}>
              <TouchableOpacity style={styles.controlButton}>
                <Ionicons name="mic-off" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton}>
                <Ionicons name="videocam-off" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.endCallButton]}
                onPress={endCall}
              >
                <Ionicons name="call" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton}>
                <Ionicons name="chatbubble" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.statusText}>
            {callStatus === 'connecting' ? 'Connecting to call...' : 'Call failed to connect'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={callStatus === 'failed' ? joinCall : endCall}
          >
            <Text style={styles.retryText}>
              {callStatus === 'failed' ? 'Retry' : 'End Call'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  callContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  callerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 40,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  actionButton: {
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  actionText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
  },
  webview: {
    flex: 1,
  },
  callControls: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  timer: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 30,
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
    transform: [{ rotate: '135deg' }],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0066CC',
    padding: 15,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SupervisionCallScreen;