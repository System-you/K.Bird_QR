"use client";
import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const Page = () => {
  const [scannedText, setScannedText] = useState("");

  useEffect(() => {
    function onScanSuccess(decodedText, decodedResult) {
      setScannedText(decodedText);
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

  return (
    <div className="w-full h-svh flex flex-col items-center justify-self-center">
      <div id="reader" className="w-[600px]"></div>
      {scannedText && <p>Scanned Text: {scannedText}</p>}
    </div>
  );
};

export default Page;