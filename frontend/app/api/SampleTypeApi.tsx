import { getCookie } from "cookies-next";
import { env } from "@/config/env.config";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ListSampleTypes = async () => {
    try {
        // Get authorization headers
        const headers = {
            'Authorization': `Bearer ${getCookie('accessToken')}`,
            'Content-Type': 'application/json',
        };

        // Send a GET request to the backend workstations endpoint
        const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/sample-types?page=1&limit=10`, {
            method: 'GET',
            headers,
        });

        // Parse the response
        const result = await response.json();

        if (response.ok) {
            console.log('Sample Types fetched successfully:', result);
            return result;
        } else {
            console.error('Failed to fetch Sample Types:', result.message);
        }
    } catch (error) {
        console.error('An error occurred while fetching Sample Types:', error);
    }
}


