"use client";
import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import fetchData from "./api";

const Page = () => {
  const [scannedText, setScannedText] = useState("");

  useEffect(() => {
    function onScanSuccess(decodedText, decodedResult) {
      setScannedText(decodedText);
      fetchData(decodedText)
        .then(data => {
          console.log(data); // Print the fetched data
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

  // Function to fetch data using the scanned QR code
  const fetchData = async (qrCode) => {
    try {
      // Perform the fetch operation using the qrCode
      const response = await fetch(`https://example.com/api?qrcode=${qrCode}`);
      const data = await response.json();
      console.log(data); // Do something with the fetched data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="w-full h-svh flex flex-col items-center justify-self-center">
      <div id="reader" className="w-[600px]"></div>
      {scannedText && <p>Scanned Text: {scannedText}</p>}
    </div>
  );
};

export default Page;