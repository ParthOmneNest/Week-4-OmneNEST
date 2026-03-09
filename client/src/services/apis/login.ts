import axios from "axios";
import { BASE_URL,getAuthHeaders } from "./config";

export const login = async (username:string,password:string)=>{
    const body={
        username:username,
        password:password
    };

    try {
        const response=await axios.post(
            `${BASE_URL}/v1/api/auth/login`,
            body, 
            {
                headers:getAuthHeaders()
            }
        );
        return response.data;
    } catch (error:any) {
         console.error("Error in Login:", error.response?.data);
        throw error;
    }
}