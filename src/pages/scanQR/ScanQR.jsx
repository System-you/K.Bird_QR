import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import Modal from "react-modal";
import toast, { Toaster } from "react-hot-toast";
import "./ScanQR.css";
import { fetchPartModel, fetchPartModelMaterials, fetchData, handlePostData } from "../../database/fetchData";

const ScanQR = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [station, setStation] = useState(localStorage.getItem("station") || "");
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [toastDisplayed, setToastDisplayed] = useState(false);

  const [partModels, setPartModels] = useState([]); 
  const [filteredModels, setFilteredModels] = useState([]); 
  const [selectedPartModel, setSelectedPartModel] = useState(""); 
  const [materialsData, setMaterialsData] = useState([]); 

  const selectedPartModelRef = useRef(selectedPartModel);
  const autoConfirmRef = useRef(autoConfirm);
  const selectedStatusRef = useRef(selectedStatus);

  selectedPartModelRef.current = selectedPartModel;
  autoConfirmRef.current = autoConfirm;

  useEffect(() => {
    selectedStatusRef.current = selectedStatus;
  }, [selectedStatus]);

  let htmlScanner = null;

  useEffect(() => {
    if (!username || !station) {
      toast.error("Username and station are required. Please log in again.");
      navigate("/login");
    }

    const handleBackButton = (event) => {
      event.preventDefault();
      window.history.pushState(null, null, window.location.pathname);
      toast.error("Cannot go back to the previous page.");
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [username, station, navigate]);

  useEffect(() => {
    const loadPartModels = async () => {
      await fetchPartModel(setLoading, setPartModels, setError); 
    };

    loadPartModels();
  }, []);

  const loadPartMaterials = useCallback(
    async (model) => {
      if (model && station) {
        await fetchPartModelMaterials(model, station, setLoading, setMaterialsData, setError);
      }
    },
    [station]
  );

  const handlePartModelChange = (e) => {
    const value = e.target.value;
    setSelectedPartModel(value);

    if (value) {
      const filtered = partModels.filter((model) =>
        model.part_model.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels([]);
    }
  };

  const handleSuggestionClick = (model) => {
    setSelectedPartModel(model.part_model);
    setFilteredModels([]);
    loadPartMaterials(model.part_model);
  };

  const validatePartModel = () => {
    const isValid = partModels.some((model) => model.part_model === selectedPartModelRef.current);
    if (!isValid) {
      toast.error("Please select a valid part model from the suggestions.");
    }
    return isValid;
  };

  const initializeScanner = () => {
    htmlScanner = new Html5QrcodeScanner(
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
    
    htmlScanner.render(onScanSuccess, (errorMessage) => {
      return;
    });
  }; 
  
  const toggleCamera = () => {
    if (selectedStatus && validatePartModel()) {
      setIsCameraActive((prev) => !prev);
    } else {
      if (!selectedStatus) {
        toast.error("Please select a status before activating the camera.");
      }
      if (!validatePartModel()) {
        toast.error("Please select a valid part model before activating the camera.");
      }
    }
  };

  useEffect(() => {
    if (isCameraActive) {
      initializeScanner();
    } else if (htmlScanner) {
      htmlScanner.clear().catch((error) => {
        console.error("Failed to clear QR code scanner: ", error);
      });
    }

    return () => {
      if (htmlScanner) {
        htmlScanner.clear().catch((error) => {
        console.error("Failed to clear QR code scanner: ", error);
      });
      }
    };
  }, [isCameraActive]);

  const closeModal = () => {
    setShowModal(false);
    setToastDisplayed(false);
  };

  const handleConfirm = useCallback(async () => {
    console.log("handleConfirm called");

    if (!fetchedData) {
        console.error("fetchedData is null or undefined inside handleConfirm");
        toast.error("Error: Fetched data is invalid. Please try again.");
        return; // Exit early if fetchedData is not set
    }

    if (scannedData && fetchedData) {  
        if (fetchedData["sts_count"] < fetchedData["matt_count"]) {
            try {
                console.log("Selected Status:", selectedStatusRef.current);
                console.log("Posting data...");
                await handlePostData(fetchedData, station, username, selectedStatusRef.current, setLoading);
                console.log("Data posted successfully");
                if (!toastDisplayed) {
                    toast.success("อัพโหลดเรียบร้อย", { duration: 5000 });
                    setToastDisplayed(true);
                }
                closeModal();
            } catch (error) {
                console.error("Error in handleConfirm:", error.message);
                toast.error("Error updating QR Code. Please try again.");
            }
        } else {
            toast.error("ไม่สามารถแสกนได้ เนื่องจากได้แสกนไปแล้วทั้งหมด");
        }
    } else {
        console.error("scannedData or fetchedData is null or undefined inside handleConfirm");
        toast.error("Error: Fetched data is invalid. Please try again.");
    }
}, [fetchedData, scannedData, station, username, toastDisplayed]);

const onScanSuccess = useCallback(async (decodedText) => {
  setScannedData(decodedText);
  console.log(`Scanned QR Code: ${decodedText}`);

  try {
      await fetchData(decodedText, station, setLoading, async (data) => {
          console.log("Fetched Data:", data);
          if (data) {
              setFetchedData(data); // Ensure this is set
              if (data.partmodel !== selectedPartModelRef.current) {
                  toast.error("part model ไม่ตรงกับที่เลือกไว้ โปรดแสกนใหม่", { duration: 5000 });
                  return;
              }

              if (autoConfirmRef.current) {
                  console.log("Auto confirming...");
                  await handleConfirm(); 
              } else {
                  console.log("Showing modal for manual confirmation...");
                  setShowModal(true);
              }
          } else {
              console.error("Fetched data is null or undefined after fetch.");
              toast.error("Error: Fetched data is invalid. Please try again.");
          }
      }, setError, closeModal);
  } catch (error) {
      console.error("Error processing scan:", error);
      toast.error("Error processing scan. Please try again.");
  }
}, [station, handleConfirm]);

const handleLogout = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("station");
  navigate("/login");
};

const handleAutoConfirmToggle = () => {
  setAutoConfirm((prev) => {
      autoConfirmRef.current = !prev;
      console.log("Auto Confirm Toggled:", !prev);
      return !prev;
  });
};

  return (
    <div className="container">
      <div className="form-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
        <label className="form-label">
          <input 
            type="checkbox" 
            checked={autoConfirm} 
            onChange={handleAutoConfirmToggle} 
            style={{ marginBottom: "20px" }}
          />
          เปิดยืนยันอัตโนมัติ
        </label>
        <label className="form-label">
          Select Part Model:
          <input
            type="text"
            value={selectedPartModel}
            onChange={handlePartModelChange}
            className="form-input"
            placeholder="Type to search part model..."
          />
          {filteredModels.length > 0 && (
            <ul className="suggestions-list">
              {filteredModels.map((model) => (
                <li
                  key={model.part_model}
                  onClick={() => handleSuggestionClick(model)}
                  className="suggestion-item"
                >
                  {model.part_model}
                </li>
              ))}
            </ul>
          )}
        </label>
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

        {materialsData.length > 0 && (
          <div className="materials-list">
            <h3>Materials for {selectedPartModel}:</h3>
            <ul>
              {materialsData.map((material) => (
                <li key={material.part_matname}>
                  {material.part_matname}: {material.sts_count}/{material.matt_count}
                </li>
              ))}
            </ul>
          </div>
        )}

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
                  <p>Inventory ทั้งหมด : {fetchedData["matt_count"]}</p>
                  <p>แสกนไปแล้ว : {fetchedData["sts_count"]}</p>
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
