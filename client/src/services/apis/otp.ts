import axios from "axios";
import { BASE_URL,getAuthHeaders } from "./config";

export const validateOtp = async (username:string,otpValue:string)=>{
    const body={
        username:username,
        otp:parseInt(otpValue,10)
    };

    try {
        const response=await axios.post(
            `${BASE_URL}/v1/api/auth/validate-otp`,
            body, 
            {
                headers:getAuthHeaders()
            }
        );
        return response.data;
    } catch (error:any) {
         console.error("Error in OTP validation:", error.response?.data);
        throw error;
    }
}