import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from 'jwt-decode'; // Correct import (note the capital D)

const useGetToken = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the token from AsyncStorage
  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);
        // Extract user ID from the token
        try {
          const decodedToken = jwtDecode(storedToken);
          setUserId(decodedToken.userId || decodedToken.id || decodedToken.sub);
        } catch (decodeError) {
          console.error("Failed to decode token:", decodeError);
        }
      }
    } catch (error) {
      console.error("Failed to fetch token:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save the token to AsyncStorage
  const saveToken = async (newToken) => {
    try {
      await AsyncStorage.setItem("authToken", newToken);
      setToken(newToken);
      
      // Extract user ID from the new token
      try {
        const decodedToken = jwtDecode(newToken); // Using correct function name
        setUserId(decodedToken.userId || decodedToken.id || decodedToken.sub);
      } catch (decodeError) {
        console.error("Failed to decode token:", decodeError);
      }
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  };

  // Remove the token from AsyncStorage
  const removeToken = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setToken(null);
      setUserId(null);
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  };

  // Fetch the token when the component mounts
  useEffect(() => {
    getToken();
  }, []);

  return { token, userId, loading, saveToken, removeToken };
};

export default useGetToken;