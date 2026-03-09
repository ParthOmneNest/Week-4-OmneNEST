import axios from "axios";
import { BASE_URL,getAuthHeaders,DEVICE_PUBLIC_KEY } from "./config";

export const preAuthHandshake=async ()=>{
    try{
        const response = await axios.post(
            `${BASE_URL}/v1/api/auth/pre-auth-handshake`,
            {
                devicePublicKey:DEVICE_PUBLIC_KEY
            },
            {
                headers:getAuthHeaders()
            }
        );
        console.log("Pre-Auth Handshake successful! ", response.data);
        return response.data;
    }catch(error:any){
        console.log("pre-Auth handshake error: ",error.response?.data);
        throw error;
    }
}