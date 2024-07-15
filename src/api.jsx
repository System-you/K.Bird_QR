import React, { useEffect, useState } from 'react';

const ApiComponent = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://api.allorigins.win/raw?url=http://203.170.129.88:9078/api/QRCode/HL-04005PW-B-324/10', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const jsonData = await response.json();
                console.log('Fetched data:', jsonData);
                setData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (data) {
            exportData(data);
        }
    }, [data]);

    const exportData = (data) => {
        // Perform the export logic here
        console.log('Exporting data:', data);
        // You can use libraries like FileSaver.js or implement your own export logic
    };

    return (
        <div>
            {loading ? (
                <p>Loading data...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            )}
        </div>
    );
};

export default ApiComponent;