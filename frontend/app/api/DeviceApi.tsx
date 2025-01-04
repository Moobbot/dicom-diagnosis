import { getCookie } from "cookies-next";
import { env } from "@/config/env.config";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ListDevice = async () => {
    try {
        // Get authorization headers
        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
        };

        // Send a GET request to the backend workstations endpoint
        const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/devices/test-connection`, {
            method: 'GET',
            headers,
        });

        // Parse the response
        const result = await response.json();

        if (response.ok) {
            console.log('Devices fetched successfully:', result);
            return result;
        } else {
            console.error('Failed to fetch devices:', result.message);
        }
    } catch (error) {
        console.error('An error occurred while fetching devices:', error);
    }
}

export type CreateDevice = {
    device_code: string;
    device_protocol: string;
    device_name: string;
    device_type: string;
    supplier: string;
    status: boolean;
    technical_link: {
      tcp_client?: {
        ip_address: string;
        port: number;
      };
      tcp_server?: {
        port: number;
      };
      serial?: {
        port: string;
        baud_rate: number;
        parity: number;
        data_bits: number;
        stop_bits: number;
      };
    };
    sample_type_code: string;
    workstation: string;
  };
export const CreateDevice = async (device: CreateDevice) => {
    console.log(NEXT_PUBLIC_API_BASE_URL)
    try {
        // Get authorization headers
        const headers = {
            'Authorization': `Bearer ${getCookie('accessToken')}`,
            'Content-Type': 'application/json',
        };
        const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/devices/test-connection`, {
            method: "POST",
            headers,
            body: JSON.stringify(device),
          });
          if (!response.ok) {
            throw new Error("Failed to fetch device");
          }
          return response.json();

        } catch (error) {
        console.error('An error occurred while creating device:', error);    
    }
}