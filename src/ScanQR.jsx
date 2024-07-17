import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Modal from "react-modal";
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

  useEffect(() => {
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
      setScannedData(decodedText);
      setShowModal(true);
      fetchData(decodedText); // Fetch data when scan is successful
    };

    const onScanFailure = (error) => {
      return
    };

    htmlScanner.render(onScanSuccess, onScanFailure);

    return () => {
      htmlScanner.clear();
    };
  }, []);

  const fetchData = async (qrCode) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.allorigins.win/raw?url=http://203.170.129.88:9078/api/QRCode/${qrCode}/10`,
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

      const jsonData = await response.json();
      console.log("Fetched data:", jsonData);
      setFetchedData(jsonData.Data); // Access the "Data" property

      const storedStatus = localStorage.getItem(qrCode);
      if (storedStatus) {
        setSelectedStatus(storedStatus);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
    closeModal();
    await handlePostData(); // Call the function to send POST request

  };

  const handlePostData = async () => {
    setLoading(true);
    try {
      const raw = JSON.stringify({
        "part_model": "HL-04005PW-B",
        "station": 10,
        "part_id": 324,
        "emp_name": "JOW",
        "status": "C"
      });
      const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
      
      fetch("https://api.allorigins.win/raw?url=http://203.170.129.88:9078/api/QRCode", requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
      // const response = await fetch(
      //   `https://api.allorigins.win/raw?url=http://203.170.129.88:9078/api/QRCode`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       part_model: "HL-04005PW-B",
      //       station: 10,
      //       part_id: 324,
      //       emp_name: "jow",
      //       status: "D",
      //     }),
          
      //   }
      // );
      // console.log("POST Data Response:", response.json);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! Status: ${response.status}`);
      // }

      // const jsonData = await response.json();
      // console.log("PATCH Data Response:", jsonData);
      // Optionally update state or perform additional actions upon successful PATCH
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <label>
          Username:
          <input type="text" value={username} onChange={handleUsernameChange} />
        </label>
        <label>
          Station:
          <input type="text" value={station} onChange={handleStationChange} />
        </label>
      </div>
      <div id="reader" className="w-[600px]"></div>
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
                  <p>QR Code: {scannedData}</p>
                  <p>Part ID: {fetchedData["Part Id"]}</p>
                  <p>Part Model: {fetchedData["Part Model"]}</p>
                  <p>ชื่อเฟอร์นิเจอร์: {fetchedData["ชื่อเฟอร์นิเจอร์"]}</p>
                  <p>ตำแหน่งชิ้นงาน: {fetchedData["ตำแหน่งชิ้นงาน"]}</p>
                  <p>ความหนา: {fetchedData["ความหนา"]}</p>
                  <p>ความกว้าง: {fetchedData["ความกว้าง"]}</p>
                  <p>ความยาว: {fetchedData["ความยาว"]}</p>
                  <p>ชื่อวัสดุ: {fetchedData["ชื่อวัสดุ"]}</p>
                  <p>สถานะ: {fetchedData["สถานะ"]}</p>
                  <label>
                    <select value={selectedStatus} onChange={handleStatusChange}>
                      <option value="">Select status</option>
                      <option value="A">A-สำเร็จ</option>
                      <option value="B">B-เสีย</option>
                      <option value="C">C-รับชิ้นงานแล้ว</option>
                      <option value="D">D-ส่งแล้ว</option>
                    </select>
                  </label>
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
    </div>
  );
};

export default ScanQR;
