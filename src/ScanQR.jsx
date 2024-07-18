import React, { useState, useEffect, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Modal from "react-modal";
import toast, { Toaster } from "react-hot-toast";
import "./ScanQR.css"; // Ensure you have the CSS for styling

const ScanQR = () => {
  const [scannedData, setScannedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [username, setUsername] = useState("");
  const [station, setStation] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchData = useCallback(
    debounce(async (qrCode, station) => {
      setLoading(true);
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(
          `https://api.allorigins.win/raw?url=http://203.170.129.88:9078/api/QRCode/${qrCode}/${station}?t=${timestamp}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const htmlResponse = await response.text();
        const jsonData = JSON.parse(htmlResponse);
        console.log("Fetched data:", jsonData);
        setFetchedData(jsonData.Data); // Access the "Data" property

        const storedStatus = localStorage.getItem(qrCode);
        if (storedStatus) {
          setSelectedStatus(storedStatus);
        } else {
          setSelectedStatus(jsonData.Data["สถานะ"]);
        }
      } catch (error) {
        toast.error(`Please scan the QR code again`);
        closeModal();
        // setError(error.message);
      } finally {
        setLoading(false);
      }
    }, 1000), [] // Adjust the debounce delay as needed
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

      const onScanSuccess = (decodedText, decodedResult) => {
        if (!username || !station) {
          toast.error("Please input the username and station before scanning the QR code.");
          return;
        }
        setScannedData(decodedText);
        setShowModal(true);
        fetchData(decodedText, station); // Fetch data when scan is successful
      };

      const onScanFailure = (error) => {
        return;
      };

      htmlScanner.render(onScanSuccess, onScanFailure);

      return () => {
        htmlScanner.clear();
      };
    }
  }, [fetchData, isCameraActive, username, station]);

  const closeModal = () => {
    setShowModal(false);
    setScannedData(null);
    setFetchedData(null);
    setSelectedStatus("");
    setError(null);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleStationChange = (e) => {
    setStation(e.target.value);
  };

  const handleConfirm = async () => {
    if (scannedData) {
      localStorage.setItem(scannedData, selectedStatus);
    }
    console.log(`Status confirmed: ${selectedStatus}`);
    try {
      await handlePostData(); // Call the function to send POST request

      // Introduce a small delay before fetching the updated data
      setTimeout(async () => {
        await fetchData(scannedData, station); // Refresh the fetched data after update
      }, 1000);

      closeModal();
    } catch (error) {
      toast.error("Error updating QR Code. Please try again.");
      console.error("Error updating QR Code:", error.message);
    }
  };

  const handlePostData = async () => {
    setLoading(true);
    try {
      const part_model = fetchedData["Part Model"];
      const part_id = parseInt(fetchedData["Part Id"]);
      const part_station = parseInt(station);
      const emp_name = username;
      const part_status = selectedStatus;

      console.log("Updating with Part Model:", part_model);
      console.log("Updating with Part ID:", part_id);
      console.log("Updating with Part Station:", part_station);
      console.log("Updating with Employee Name:", emp_name);
      console.log("Updating with Part Status:", part_status);
      const timestamp = new Date().getTime();
      const url = `https://api.allorigins.win/raw?url=http://203.170.129.88:9078/api/QRCode_update/${part_model}/${part_id}/${part_station}/${emp_name}/${part_status}?t=${timestamp}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      toast.success("QR Code updated successfully");
      console.log("Update Result:", result);

    } catch (error) {
      toast.error("Error updating QR Code plese try again");
      console.error("Error updating QR Code:", error.message);
      setLoading(false);
    }
  };

  const toggleCamera = () => {
    if (username && station) {
      setIsCameraActive(!isCameraActive);
    } else {
      toast.error("Please input the username and station before activating the camera.");
    }
  };

  return (
    <div style={{ padding: '10px', maxWidth: '600px', margin: 'auto', backgroundColor: 'white', color: 'black' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'black' }}>
          Username:
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            disabled={isCameraActive}
            style={{ width: '100%', padding: '10px', fontSize: '16px', color: 'black', backgroundColor: 'white' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'black' }}>
          Station:
          <input
            type="text"
            value={station}
            onChange={handleStationChange}
            disabled={isCameraActive}
            style={{ width: '100%', padding: '10px', fontSize: '16px', color: 'black', backgroundColor: 'white' }}
          />
        </label>
      </div>
      <button
        onClick={toggleCamera}
        style={{ width: '100%',allignment: 'center', padding: '10px', fontSize: '18px', cursor: 'pointer', color: 'black', backgroundColor: 'white',border: '1px solid black' }}
      >
        {isCameraActive ? "Hide Camera" : "Show Camera"}
      </button>
      {isCameraActive && <div id="reader" className="w-[600px]" style={{ backgroundColor: 'white' }}></div>}
      {showModal && (
        <Modal isOpen={showModal} onRequestClose={closeModal} ariaHideApp={false} style={{ overlay: { backgroundColor: 'white' }, content: { color: 'black' } }}>
          <div className="api-modal" style={{ backgroundColor: 'white', color: 'black' }}>
            {/* Modal content with updated styles */}
          </div>
        </Modal>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default ScanQR;