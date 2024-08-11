import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import Modal from "react-modal";
import toast, { Toaster } from "react-hot-toast";
import useUserStore from "../../config/store"; // Import Zustand store
import "./ScanQR.css"; // Ensure you have the CSS for styling

const ScanQR = () => {
  const navigate = useNavigate();
  const {
    username,
    station,
    fetchedData,
    loading,
    error,
    fetchData,
    handlePostData,
    setFetchedData,
    setError,
  } = useUserStore();

  const [scannedData, setScannedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (!username || !station) {
      toast.error("Username and station are required. Please log in again.");
      navigate("/login");
    }
  }, [username, station, navigate]);

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
          disableFlip: true,
        },
        false
      );

      const onScanSuccess = async (decodedText) => {
        setScannedData(decodedText);
        await fetchData(decodedText, station, closeModal);
        setShowModal(true);
      };

      htmlScanner.render(onScanSuccess, () => {});
      return () => htmlScanner.clear();
    }
  }, [fetchData, isCameraActive, station]);

  const closeModal = () => {
    setShowModal(false);
    setScannedData(null);
    setFetchedData(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (scannedData && fetchedData["total_scans"] < fetchedData["inventory"]) {
      try {
        await handlePostData(station, username, selectedStatus);
        toast.success("อัพโหลดเรียบร้อย", { duration: 5000 });
        closeModal();
      } catch (error) {
        toast.error("Error updating QR Code. Please try again.");
      }
    } else if (fetchedData["total_scans"] >= fetchedData["inventory"]) {
      toast.error("ไม่สามารถแสกนได้ เนื่องจากได้แสกนไปแล้วทั้งหมด");
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
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="form-input">
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
                  <p>สถานะ: {fetchedData["sts_name"]}</p>
                  <p>Inventory ทั้งหมด : {fetchedData["inventory"]}</p>
                  <p>แสกนไปแล้ว : {fetchedData["total_scans"]}</p>
                  <p>New Status: {selectedStatus}</p>
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
