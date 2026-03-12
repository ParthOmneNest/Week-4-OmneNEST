import axios from "axios";
import { BASE_URL, getAuthHeaders } from "./config";

// indices.ts
const cache: Record<string, any[]> = {}; // Store the ARRAY specifically

export const getIndices = async (exchange: string) => {
  const token = localStorage.getItem('bearer_token');
  if (!token) throw new Error("No token");

  // Check cache first
  if (cache[exchange]) {
    console.log("Returning cached data for", exchange);
    return cache[exchange];
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/v1/middleware-bff/stocks/index`,
      { exchange },
      { headers: getAuthHeaders(token) }
    );

    // Extract the array from the response
    const details = response.data?.IndexDetails || [];
    
    // Save the array to cache
    cache[exchange] = details;
    
    return details;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
