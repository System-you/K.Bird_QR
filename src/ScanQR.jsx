import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const Page = () => {
  const [scannedText, setScannedText] = useState("");
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    function onScanSuccess(decodedText, decodedResult) {
      setScannedText(decodedText);
      fetchData(decodedText)
        .then(data => {
          setApiData(data); // Set the fetched data
        })
        .catch(error => {
          console.error("Error fetching data:", error);
        });
    }
    function onScanFailure(error) {
      console.warn(`Code scan error = ${error}`);
    }

    const htmlScanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      true
    );

    htmlScanner.render(onScanSuccess, onScanFailure);

    return () => {
      htmlScanner.clear();
    };
  }, []);

  const fetchData = async (qrCode) => {
    try {
      const response = await fetch(`http://203.170.129.88:9078/api/QRCode/${qrCode}/10`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  return (
    <div className="w-full h-svh flex flex-col items-center justify-self-center">
      <div id="reader" className="w-[600px]"></div>
      {scannedText && <p>Scanned Text: {scannedText}</p>}
      {apiData && (
        <div>
          <h2>API Data:</h2>
          <pre>{JSON.stringify(apiData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Page;