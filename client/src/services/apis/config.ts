import { getTimeStamp } from "@/shared/utils/timestamp";

// static device key which server looks for while handshaking
export const DEVICE_PUBLIC_KEY="LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0NCk1Gd3dEUVlKS29aSWh2Y05BUUVCQlFBRFN3QXdTQUpCQUxmQUp0Uy9ZcjVWSCtNUTVUZmkvTG1zNUZldDNMM3g2SUNYMW9zME15RWpjUC9ldmFGdFYrZkJOTTBKRG5WQ3h3alZwRkNHaElybkt1S3d1Y2pUUndrQ0F3RUFBUT09DQotLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0="

export const BASE_URL = '/api-proxy';
export const DEVICE_ID = '2abe6bee-768f-4714-ab8d-2da64540bda8'

export const getAuthHeaders=(token?:string)=>{
    const current_timestamp=getTimeStamp();
    const headers: any = {
        'Content-Type': 'application/json',
        'appName': 'NVantage - Middleware Qa',
        'packageName': 'com.coditas.omnenest.omnenest_mobile_app.middlewareqa',
        'deviceId': '2abe6bee-768f-4714-ab8d-2da64540bda8', // Use your exact ID
        'appInstallId': '2abe6bee-768f-4714-ab8d-2da64540bda8',
        'timestamp': current_timestamp,
        'xRequestId': `2abe6bee-768f-4714-ab8d-2da64540bda8-${current_timestamp}`, // Strict format
        'os': 'android',
        'source': 'MOB',
        'buildNumber': '10005',
        'appVersion': '1.0.6',
        'deviceIp': '10.0.2.16', // Added from your requirement list
        'userAgent': 'com.coditas.omnenest.omnenest_mobile_app.middlewareqa/1.0.6 (Google google sdk_gphone64_x86_64; Android 15 SDK35)'
    };

    if(token){
        headers['Authorization']=`Bearer ${token}`;
    }

    return headers;
}