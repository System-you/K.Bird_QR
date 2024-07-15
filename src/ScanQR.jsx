import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const Page = () => {
  const [scannedData, setScannedData] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const htmlScanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false // disable initial scanning
    );

    function onScanSuccess(decodedText, decodedResult) {
      setScannedData(decodedText);
      setIsScanning(false);
      setShowPopup(true);
      htmlScanner.pause(true); // Pause the scanner
    }

    function onScanFailure(error) {
      console.error("Scan failed:", error);
    }

    htmlScanner.render(onScanSuccess, onScanFailure);
    setScanner(htmlScanner);

    return () => {
      htmlScanner.clear();
    };
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    setIsScanning(true);
    if (scanner) {
      scanner.resume(); // Resume scanning
    }
  };

  return (
    <div className="w-full h-svh flex flex-col items-center justify-self-center">
      <div id="reader" className="w-[600px]"></div>
      {showPopup && (
        <>
          <div className="popup-overlay" onClick={closePopup}></div>
          <div className="popup">
            <p>Scanned Data: {scannedData}</p>
            <button className="close-btn" onClick={closePopup}>Close</button>
          </div>
        </>
      )}
      {!isScanning && <p>Scan Complete</p>}
    </div>
  );
};

export default Page;