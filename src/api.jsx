async function fetchData(qrCode) {
    try {
        const response = await fetch(`http://203.170.129.88:9078/api/QRCode/${qrCode}/10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add any required headers here
            },
            // Add any required request parameters here
        });

        if (!response.ok) {
            throw new Error('Request failed');
        }

        const data = await response.json();
        // Process the received data here

        return data;
    } catch (error) {
        console.error('Error:', error);
        // Handle the error here
    }
}

export default fetchData;
