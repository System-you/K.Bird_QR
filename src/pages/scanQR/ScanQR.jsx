import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import Modal from "react-modal";
import toast, { Toaster } from "react-hot-toast";
import { Howl } from 'howler';
import "./ScanQR.css";
import {
  fetchPartModel,
  fetchPartModelMaterials,
  fetchData,
  handlePostData,
} from "../../database/fetchData";

const ScanQR = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const station = "10"; // Station is fixed as 10
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [toastDisplayed, setToastDisplayed] = useState(false);

  const [partModels, setPartModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedPartModel, setSelectedPartModel] = useState("");
  const [materialsData, setMaterialsData] = useState([]);
  const [isVisible, setIsVisible] = useState(false); // Single visibility state for all materials
  const totalScan = materialsData.reduce((acc, material) => acc + material.scan, 0);
  const totalCount = materialsData.reduce((acc, material) => acc + material.count, 0);
  const totalAllCount = materialsData.reduce((acc, material) => acc + material.all_count, 0);

  const selectedPartModelRef = useRef(selectedPartModel);
  const autoConfirmRef = useRef(autoConfirm);

  selectedPartModelRef.current = selectedPartModel;
  autoConfirmRef.current = autoConfirm;

  const fetchedDataRef = useRef(null);
  useEffect(() => {
    fetchedDataRef.current = fetchedData;
  }, [fetchedData]);

  const successSound = new Howl({
    src: ['/system-notification-199277.mp3'], // Replace with the path to your sound file
    volume: 1.0,
  });

  let htmlScanner = null;

  useEffect(() => {
    if (!username) {
      toast.error("Username is required. Please log in again.");
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
  }, [username, navigate]);

  useEffect(() => {
    const loadPartModels = async () => {
      await fetchPartModel(setLoading, setPartModels, setError);
    };

    loadPartModels();
  }, []);

  const loadPartMaterials = useCallback(
    async (model) => {
      if (model) {
        await fetchPartModelMaterials(
          model,
          station,
          setLoading,
          setMaterialsData,
          setError
        );
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
    const isValid = partModels.some(
      (model) => model.part_model === selectedPartModelRef.current
    );
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

    setTimeout(() => {
      const buttons = [
        document.querySelector("#html5-qrcode-button-camera-permission"),
        document.querySelector("#html5-qrcode-button-camera-start"),
        document.querySelector("#html5-qrcode-button-camera-stop"),
        document.querySelector("#html5-qrcode-button-scan-qr"),
      ];

      buttons.forEach((button) => {
        if (button) {
          button.style.fontSize = "14px";
          button.style.padding = "8px";
          button.style.color = "white";
          button.style.backgroundColor = "black";
        }
      });
    }, 500);
  };

  const toggleCamera = () => {
    if (validatePartModel()) {
      setIsCameraActive((prev) => !prev);
    } else {
      if (!validatePartModel()) {
        toast.error(
          "Please select a valid part model before activating the camera."
        );
      }
    }
  };

  useEffect(() => {
    if (isCameraActive) {
      initializeScanner();
    } else if (htmlScanner) {
      htmlScanner.clear().catch((error) => {
        // console.error("Failed to clear QR code scanner: ", error);
      });
    }

    return () => {
      if (htmlScanner) {
        htmlScanner.clear().catch((error) => {
          // console.error("Failed to clear QR code scanner: ", error);
        });
      }
    };
  }, [isCameraActive]);

  const closeModal = () => {
    setShowModal(false);
    setToastDisplayed(false);
  };

  const handleConfirm = useCallback(
    async () => {
      console.log("handleConfirm called");
  
      const data = fetchedDataRef.current;
  
      if (!data) {
        console.error("fetchedData is null or undefined inside handleConfirm");
        toast.error("Error: Fetched data is invalid. Please try again.");
        return;
      }
  
      try {
        const partModel = selectedPartModelRef.current;
        const partId = data.partId;
  
        if (!partModel || !partId) {
          console.error("partModel or partId is undefined");
          toast.error("Error: Part model or part ID is missing. Please try again.");
          return;
        }
  
        console.log("partModel:", partModel);
        console.log("partId:", partId);
  
        await handlePostData(
          data,
          station,
          setLoading
        );
        console.log("Data posted successfully");
  
        if (!toastDisplayed) {
          // Play success sound
          successSound.play();
          setToastDisplayed(true);
        }
  
        await fetchPartModelMaterials(
          partModel,
          station,
          setLoading,
          setMaterialsData,
          setError
        );
  
        closeModal();
      } catch (error) {
        console.error("Error posting data:", error);
      }
    },
    [station, toastDisplayed]
  );
  
  const onScanSuccess = useCallback(
    async (decodedText) => {
      try {
        await fetchData(
          decodedText,
          station,
          setLoading,
          async (data) => {
            if (data) {
              setFetchedData(data);
              fetchedDataRef.current = data;
              if (data.partmodel !== selectedPartModelRef.current) {
                toast.error("Part model ไม่ตรงกับที่เลือกไว้ โปรดแสกนใหม่", {
                  duration: 5000,
                });
                return;
              }
  
              if (autoConfirmRef.current) {
                handleConfirm();
              } else {
                setShowModal(true);
              }
            } else {
              console.error("Error: Fetched data is null or undefined.");
              toast.error("Error: Fetched data is invalid. Please try again.");
            }
          },
          setError,
          closeModal
        );
      } catch (error) {
        toast.error("Error processing scan. Please try again.");
      }
    },
    [station, handleConfirm]
  );

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handleAutoConfirmToggle = () => {
    setAutoConfirm((prev) => {
      autoConfirmRef.current = !prev;
      return !prev;
    });
  };

  return (
    <div className="container">
      <div className="form-container">
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
          Select Part Model(Project Name):
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

        {materialsData.length > 0 && (
          <div className="materials-list" style={{paddingBottom:"20px"}}>
            <h3>
              Materials for {selectedPartModel}:
              <span 
                onClick={() => setIsVisible(!isVisible)}
                style={{ cursor: 'pointer', marginLeft: '10px' }}
              >
                {isVisible ? "🔓" : "🔒"} {/* You can replace with icons if needed */}
              </span>
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th style={{ textAlign: "right" }}></th>
                  <th style={{ textAlign: "right" }}></th>
                  {isVisible && <th style={{ textAlign: "right" }}>All </th>}
                </tr>
              </thead>
              <tbody>
                {materialsData.map((material) => (
                  <tr key={material.part_matname} >
                    <td >{material.part_matname}</td>
                    <td style={{  textAlign: "right" ,paddingRight:"10px" ,paddingLeft:"110px"}}>{material.scan}</td>
                    <td style={{textAlign: "right",paddingRight:"10px" }}>{material.count}</td>
                    {isVisible && <td style={{ textAlign: "right" }}>{material.all_count}</td>}
                  </tr>
                ))}
                <tr>
                  <td><strong>Total</strong></td>
                  <td style={{ textAlign: "right",paddingRight:"10px" }}><strong>{totalScan}</strong></td>
                  <td style={{ textAlign: "right" ,paddingRight:"10px"}}><strong>{totalCount}</strong></td>
                  {isVisible && <td style={{ textAlign: "right" }}><strong>{totalAllCount}</strong></td>}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={toggleCamera}
          style={{ backgroundColor: "black", color: "white" }}
        >
          {isCameraActive ? "Hide Camera" : "Show Camera"}
        </button>

        <button
          onClick={handleLogout}
          style={{ color: "white", backgroundColor: "black", marginTop: "20px", marginLeft: "auto" }}
        >
          Logout
        </button>
      </div>

      {isCameraActive && <div id="reader" className="reader"></div>}

      {showModal && (
        <Modal
          isOpen={showModal}
          onRequestClose={closeModal}
          ariaHideApp={false}
        >
          <div className="api-modal">
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
              fetchedData && (
                <div>
                  <p>Part ID: {fetchedData["partId"]}</p>
                  <p>Part Model (Project Name): {fetchedData["partmodel"]}</p>
                  <p>ชื่อเฟอร์นิเจอร์: {fetchedData["sub_assem"]}</p>
                  <p>ตำแหน่งชิ้นงาน: {fetchedData["description"]}</p>
                  <p>ความหนา: {fetchedData["part_thickness"]}</p>
                  <p>ความกว้าง: {fetchedData["part_width"]}</p>
                  <p>ความยาว: {fetchedData["part_length"]}</p>
                  <p>ชื่อวัสดุ: {fetchedData["part_matname"]}</p>
                  <div className="modal-buttons">
                    <button
                      onClick={handleConfirm}
                      style={{ backgroundColor: "black" }}
                    >
                      OK
                    </button>
                    <button
                      onClick={closeModal}
                      style={{ backgroundColor: "black" }}
                    >
                      Cancel
                    </button>
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
