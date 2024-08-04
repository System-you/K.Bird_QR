import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import Modal from "react-modal";
import toast, { Toaster } from "react-hot-toast";
import { fetchData, debounce, handlePostData } from "../../database/fetchData"; // Import fetchData, debounce, and handlePostData
import "./ScanQR.css"; // Ensure you have the CSS for styling

const ScanQR = () => {
  const navigate = useNavigate();
  const [scannedData, setScannedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [station, setStation] = useState(localStorage.getItem("station") || "");
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (!username || !station) {
      toast.error("Username and station are required. Please log in again.");
      navigate("/login");
    }
  }, [username, station, navigate]);

  const fetchDataCallback = useCallback(
    async (qrCode, station) => {
      try {
        const data = await fetchData(qrCode, station, setLoading, setFetchedData, setError, closeModal);
        setFetchedData(data);
        console.log("Fetched data:", data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    },
    []
  );

  useEffect(() => {
    if (isCameraActive) {
      const htmlScanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          disableFlip: true, // Disable the "Scan paused" text
        },
        false
      );

      const onScanSuccess = async (decodedText, decodedResult) => {
        console.log("Scan successful:", decodedText);
        setScannedData(decodedText);
        await fetchDataCallback(decodedText, station); // Fetch data when scan is successful
        setShowModal(true);
      };

      const onScanFailure = (error) => {
        return
      };

      htmlScanner.render(onScanSuccess, onScanFailure);

      return () => {
        htmlScanner.clear();
      };
    }
  }, [fetchDataCallback, isCameraActive, username, station]);

  const closeModal = () => {
    setShowModal(false);
    setScannedData(null);
    setFetchedData(null);
    setError(null);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    console.log("Selected status changed to:", e.target.value);
  };

  const handleConfirm = async () => {
    if (scannedData) {
      console.log(`Status confirmed: ${selectedStatus}`);
      try {
        await handlePostData(fetchedData, station, username, selectedStatus, setLoading); // Call the function to send POST request
        console.log("Data posted successfully");

        // Introduce a small delay before fetching the updated data
        setTimeout(async () => {
          await fetchDataCallback(scannedData, station); // Refresh the fetched data after update
        }, 1000);

        closeModal();
      } catch (error) {
        toast.error("Error updating QR Code. Please try again.");
        console.error("Error updating QR Code:", error.message);
      }
    }
  };

  const toggleCamera = () => {
    if (selectedStatus) {
      setIsCameraActive(!isCameraActive);
    } else {
      toast.error("Please select a status before activating the camera.");
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <label className="form-label">
          Select Status:
          <select value={selectedStatus} onChange={handleStatusChange} className="form-input">
            <option value="">Select...</option>
            <option value="A">A-สำเร็จ</option>
            <option value="B">B-เสีย</option>
            <option value="C">C-รับชิ้นงานแล้ว</option>
            <option value="D">D-ส่งแล้ว</option>
          </select>
        </label>
        <button onClick={toggleCamera} className="toggle-camera-button">
          {isCameraActive ? "Hide Camera" : "Show Camera"}
        </button>
      </div>
      {isCameraActive && <div id="reader" className="reader"></div>}
      {showModal && (
        <Modal isOpen={showModal} onRequestClose={closeModal} ariaHideApp={false}>
          <div className="api-modal">
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
              fetchedData && (
                <div>
                  <p>Part ID: {fetchedData["partId"]}</p>
                  <p>Part Model: {fetchedData["partmodel"]}</p>
                  <p>ชื่อเฟอร์นิเจอร์: {fetchedData["sub_assem"]}</p>
                  <p>ตำแหน่งชิ้นงาน: {fetchedData["description"]}</p>
                  <p>ความหนา: {fetchedData["part_thickness"]}</p>
                  <p>ความกว้าง: {fetchedData["part_width"]}</p>
                  <p>ความยาว: {fetchedData["part_length"]}</p>
                  <p>ชื่อวัสดุ: {fetchedData["part_matname"]}</p>
                  <p>สถานะ: {fetchedData["sts_name"]}</p> {/* Show fetched status */}
                  <p>New Status: {selectedStatus}</p> {/* Show selected status */}
                  <div className="modal-buttons">
                    <button onClick={handleConfirm}>OK</button>
                    <button onClick={closeModal}>Cancel</button>
                  </div>
                </div>
              )
            )}
          </div>
        </Modal>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default ScanQR;
