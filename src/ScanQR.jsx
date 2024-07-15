import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import ApiComponent from "./api";
import Modal from "react-modal";
import "./ScanQR.css"; // Ensure you have the CSS for styling

const ScanQR = () => {
  const [scannedData, setScannedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [qrStatuses, setQrStatuses] = useState({});

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
      false
    );

    const onScanSuccess = (decodedText, decodedResult) => {
      setScannedData(decodedText);
      setShowModal(true);
      htmlScanner.pause(true); // Pause the scanner
    };

    const onScanFailure = (error) => {
      console.error("Scan failed:", error);
    };

    htmlScanner.render(onScanSuccess, onScanFailure);

    return () => {
      htmlScanner.clear();
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setScannedData(null);
  };

  const updateQrStatus = (qrCode, status) => {
    setQrStatuses((prevStatuses) => ({
      ...prevStatuses,
      [qrCode]: status,
    }));
  };

  return (
    <div>
      <div id="reader" className="w-[600px]"></div>
      {scannedData && (
        <Modal isOpen={showModal} onRequestClose={closeModal}>
          <ApiComponent
            qrCode={scannedData}
            closeModal={closeModal}
            updateQrStatus={updateQrStatus}
            status={qrStatuses[scannedData]}
          />
        </Modal>
      )}
    </div>
  );
};

export default ScanQR;