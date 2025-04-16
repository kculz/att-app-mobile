import { useState, useCallback } from "react";
import axios, { AxiosRequestConfig, AxiosError } from "axios";

const BASE_URL = "http://172.20.10.7:3001/api/v1"; // Change this to your backend URL

type HttpMethod = "GET" | "POST" | "DELETE" | "PATCH";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  request: (endpoint: string, method?: HttpMethod, body?: any, config?: AxiosRequestConfig) => Promise<T | null>;
}

export const useApi = <T = any>(token?: string): ApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const request = useCallback(
    async (endpoint: string, method: HttpMethod = "GET", body?: any, config?: AxiosRequestConfig): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...config?.headers,
        };

        console.log("Making API request to:", `${BASE_URL}${endpoint}`);
        console.log("Request Method:", method);
        console.log("Request Body:", body);
        console.log("Request Headers:", headers);

        const response = await axios({
          method,
          url: `${BASE_URL}${endpoint}`,
          data: body,
          headers,
          timeout: 10000, // 10 seconds timeout
          ...config,
        });

        console.log("API Response:", response.data);

        if (response.data) {
          setData(response.data);
          return response.data; // Return the data for chaining
        } else {
          console.error("API Response is empty or undefined");
          setError("No data received from the server");
          return null;
        }
      } catch (err) {
        const axiosError = err as AxiosError;

        if (axiosError.response) {
          // The request was made and the server responded with a status code
          console.error("API Error Response:", axiosError.response.data);
          setError(
            axiosError.response.data?.message ||
              axiosError.response.data?.error ||
              "Something went wrong"
          );
        } else if (axiosError.request) {
          // The request was made but no response was received
          console.error("API Error: No response received", axiosError.request);
          setError("No response received from the server");
        } else {
          // Something happened in setting up the request
          console.error("API Error:", axiosError.message);
          setError(axiosError.message || "Something went wrong");
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { data, error, loading, request };
};