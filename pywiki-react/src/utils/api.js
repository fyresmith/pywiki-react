export const API_BASE_URL = '/api';

export function APICall(endPoint) {
    try {
        const response = fetch(API_BASE_URL + endPoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        return response;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }
}