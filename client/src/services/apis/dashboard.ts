import axios from "axios";
import { BASE_URL, getAuthHeaders } from "./config";

export const getDashboardConfig = async ()=>{
  const token = localStorage.getItem('bearer_token');

  if(!token){
    throw new Error("No bearer token present in local storage.")
  }

    try {
        const response=await axios.get(
            `${BASE_URL}/v1/api/profile/dashboard-config`,
            {
                headers:getAuthHeaders(token)
            }
        );
        return response.data;
    } catch (error:any) {
         console.error("Error in Dashboard API:", error.response?.data || error.message);
        throw error;
    }
}