import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useGetToken = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the token from AsyncStorage
  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);
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
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  };

  // Remove the token from AsyncStorage
  const removeToken = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setToken(null);
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  };

  // Fetch the token when the component mounts
  useEffect(() => {
    getToken();
  }, []);

  return { token, loading, saveToken, removeToken };
};

export default useGetToken;