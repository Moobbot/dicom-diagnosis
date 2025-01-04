import { getCookie } from "cookies-next";
import { env } from "@/config/env.config";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ListWorkstations = async () => {
    try {
        // Get authorization headers
        const headers = {
            'Authorization': `Bearer ${getCookie('accessToken')}`,
            'Content-Type': 'application/json',
        };

        // Send a GET request to the backend workstations endpoint
        const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/workstations`, {
            method: 'GET',
            headers,
        });

        // Parse the response
        const result = await response.json();

        if (response.ok) {
            console.log('Workstations fetched successfully:', result);
            return result;
        } else {
            console.error('Failed to fetch workstations:', result.message);
        }
    } catch (error) {
        console.error('An error occurred while fetching workstations:', error);
    }
}

type CreateWorkstation = {
    name: string;
    workstation_link: string;
  };
  export const CreateWorkstation = async (workstation: CreateWorkstation) => {
    try {
        const headers = {
            'Authorization': `Bearer ${getCookie('accessToken')}`,
            'Content-Type': 'application/json',
        };

        console.log('Request Headers:', headers);
        console.log('Request Body:', JSON.stringify(workstation));

        const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/workstations`, {
            method: "POST",
            headers,
            body: JSON.stringify(workstation),
        });

        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text(); 
            console.error('Response Error Text:', errorText);
            throw new Error(`API Error: ${response.statusText} (${response.status})`);
        }

        const responseData = await response.json();
        console.log('Response Data:', responseData);

        return responseData;
    } catch (error) {
        console.error('An error occurred while creating workstation:', error);
        throw error;
    }
};