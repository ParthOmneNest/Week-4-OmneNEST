import axios from "axios";
import { BASE_URL, getAuthHeaders } from "./config";

export const getWatchList=async()=>{
  const token = localStorage.getItem('bearer_token');

  if(!token){
    throw new Error("No bearer token present in local storage.")
  }
      try {
        const response=await axios.get(
            `${BASE_URL}/v1/api/watchlist/list`,
            {
                headers:getAuthHeaders(token)
            }
        );
        return response.data;
    } catch (error:any) {
         console.error("WatchList GET error:", error.response?.status,error.response?.data || error.message);
        throw error;
    }
}

export const getWatchlistScripts=async(watchListId:number)=>{
  const token = localStorage.getItem('bearer_token');

  if(!token){
    throw new Error("No bearer token present in local storage.")
  }
        try {
        const response=await axios.post(
            `${BASE_URL}/v1/api/watchlist/scrips/list`,
            {watchListId},
            {
                headers:getAuthHeaders(token)
            }
        );
        return response.data;
    } catch (error:any) {
         console.error("Error in WatchList Script API:", error.response?.data || error.message);
        throw error;
    }
}