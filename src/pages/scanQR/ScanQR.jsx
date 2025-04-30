import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Modal from "react-modal";
import toast, { Toaster } from "react-hot-toast";
import { Howl } from "howler";
import "./ScanQR.css";
import {
  fetchPartModel,
  fetchPartModelMaterials,
  fetchData,
  handlePostData,
  fetchListLastPrintData,
} from "../../database/fetchData";

const ScanQR = () => {
  const [username] = useState(localStorage.getItem("username") || "");
  const station = "10";
  const [fetchedData, setFetchedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [partModels, setPartModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [listLastPrintData, setListLastPrintData] = useState([]);
  console.log(listLastPrintData);
  const [showlistLastPrint, setShowlistLastPrint] = useState(false);
  const [selectedPartModel, setSelectedPartModel] = useState("");
  const [selectedPrint, setSelectedPrint] = useState("");
  const [materialsData, setMaterialsData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const totalScan = materialsData.reduce(
    (acc, material) => acc + material.scan,
    0
  );
  const totalCount = materialsData.reduce(
    (acc, material) => acc + material.count,
    0
  );
  const totalAllCount = materialsData.reduce(
    (acc, material) => acc + material.all_count,
    0
  );

  const successSound = new Howl({
    src: ["/system-notification-199277.mp3"],
    volume: 1.0,
  });
  let htmlScanner = null;

  const loadPartMaterials = async (model) => {
    if (model) {
      await fetchPartModelMaterials(model, setMaterialsData);
    }
  };

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

  const handleLastPrintinputClick = () => {
    setSelectedPrint(listLastPrintData.data[0].station8_print);
    setShowlistLastPrint(true);
  };

  const handlePrintChange = (e) => {
    const value = e.target.value;
    setSelectedPrint(value);

    if (value) {
      const filtered = listLastPrintData.data.filter((model) =>
        model.station8_print.toLowerCase().includes(value.toLowerCase())
      );
      setSelectedPrint(filtered);
    } else {
      setSelectedPrint([]);
    }
  };

  const get_list_LastPrint = async (part_model) => {
    console.log("part_model:", part_model);
    const data = await fetchListLastPrintData(part_model);
    console.log("data part_model", data);
    setListLastPrintData(data);
  };

  const handleSuggestionClick = (model) => {
    setSelectedPartModel(model.part_model);
    console.log("model?.part_model:", model?.part_model);
    get_list_LastPrint(model?.part_model);
    setFilteredModels([]);
    loadPartMaterials(model.part_model);
  };

  const handleLastPrintClick = (model) => {
    setSelectedPrint(model);
    setShowlistLastPrint(false);
  };

  const validatePartModel = () => {
    const isValid = partModels.some(
      (model) => model.part_model === selectedPartModel
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
        fps: 60,
        qrbox: {
          width: 250,
          height: 250,
        },
        disableFlip: true,
        decodeOnce: false,
      },
      false
    );

    htmlScanner.render(onScanSuccess, (errorMessage) => {
      console.error("errorMessage: ", errorMessage);
      return;
    });

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
  };

  const toggleCamera = () => {
    if (validatePartModel()) {
      setIsCameraActive((prev) => !prev);
    } else {
      toast.error(
        "Please select a valid part model before activating the camera."
      );
    }
  };

  const handleConfirm = async () => {
    const data = fetchedData;
    console.log("data handleConfirm :", data);
    if (!data) {
      console.error("fetchedData is null or undefined inside handleConfirm");
      toast.error("Error: Fetched data is invalid. Please try again.");
      return;
    }

    try {
      const partModel = selectedPartModel;
      const partId = data.partId;

      if (!partModel || !partId) {
        console.error("partModel or partId is undefined");
        toast.error(
          "Error: Part model or part ID is missing. Please try again."
        );
        return;
      }

      await handlePostData(data, station,selectedPrint);

      // ปิดกล้องหลังจากยืนยันข้อมูล
      if (htmlScanner) {
        htmlScanner.clear().catch((error) => {
          console.error("Failed to clear QR code scanner: ", error);
        });
      }

      await fetchPartModelMaterials(partModel, setMaterialsData);
      closeModal();
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const onScanSuccess = async (decodedText) => {
    // ปิดกล้องเพื่อแสดง Modal
    setIsCameraActive(false);
    htmlScanner.clear().catch((error) => {
      console.error("Failed to clear QR code scanner: ", error);
    });

    try {
      await fetchData(
        decodedText,
        station,
        onScanFinished,
        closeModal,
        selectedPrint
      );
    } catch (error) {
      console.error("Error processing scan:", error);
      toast.error("Error processing scan. Please try again.");
    }
  };

  const onScanFinished = async (resData) => {
    if (resData) {
      setFetchedData(resData);

      // ตรวจสอบ Part Model
      if (resData.partmodel !== selectedPartModel) {
        toast.error("Part model ไม่ตรงกับที่เลือกไว้ โปรดแสกนใหม่", {
          duration: 5000,
        });
        return;
      }

      // เปิดเสียงเมื่อสแกนเสร็จ
      successSound.play();

      // แสดง Modal
      if (autoConfirm) {
        await handleConfirm();
        initializeScanner();
      } else {
        setShowModal(true);
      }
    } else {
      console.error("Error: Fetched data is null or undefined.");
      toast.error("Error: Fetched data is invalid. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsCameraActive(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    window.location.replace("/login");
  };

  useEffect(() => {
    const loadPartModels = async () => {
      await fetchPartModel(setPartModels);
    };

    loadPartModels();
  }, []);

  useEffect(() => {
    if (!username) {
      toast.error("Username is required. Please log in again.");
      window.location.replace("/login");
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
  }, [username]);

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

  return (
    <div className="container">
      <div className="form-container">
        <label className="form-label">
          <input
            type="checkbox"
            checked={autoConfirm}
            onChange={() => setAutoConfirm((prev) => !prev)}
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
          ครั้งที่ :
          <input
            type="text"
            value={selectedPrint}
            onClick={handleLastPrintinputClick}
            onChange={handlePrintChange}
            className="form-input"
            placeholder="ครั้งที่พิมพ์"
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
          {showlistLastPrint === true && (
            <ul className="suggestions-list">
              {listLastPrintData.data.map((model, index) => (
                <li
                  key={index}
                  onClick={() => handleLastPrintClick(model.station8_print)}
                  className="suggestion-item"
                >
                  {model.station8_print}
                </li>
              ))}
            </ul>
          )}
        </label>

        {materialsData.length > 0 && (
          <div className="materials-list" style={{ paddingBottom: "20px" }}>
            <h3>
              Materials for {selectedPartModel}:
              <span
                onClick={() => setIsVisible(!isVisible)}
                style={{ cursor: "pointer", marginLeft: "10px" }}
              >
                {isVisible ? "🔓" : "🔒"}{" "}
                {/* You can replace with icons if needed */}
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
                  <tr key={material.part_matname}>
                    <td>{material.part_matname}</td>
                    <td
                      style={{
                        textAlign: "right",
                        paddingRight: "10px",
                        paddingLeft: "110px",
                      }}
                    >
                      {material.scan}
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "10px" }}>
                      {material.count}
                    </td>
                    {isVisible && (
                      <td style={{ textAlign: "right" }}>
                        {material.all_count}
                      </td>
                    )}
                  </tr>
                ))}
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td style={{ textAlign: "right", paddingRight: "10px" }}>
                    <strong>{totalScan}</strong>
                  </td>
                  <td style={{ textAlign: "right", paddingRight: "10px" }}>
                    <strong>{totalCount}</strong>
                  </td>
                  {isVisible && (
                    <td style={{ textAlign: "right" }}>
                      <strong>{totalAllCount}</strong>
                    </td>
                  )}
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
          style={{
            color: "white",
            backgroundColor: "black",
            marginTop: "20px",
            marginLeft: "auto",
          }}
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
            {fetchedData && (
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
            )}
          </div>
        </Modal>
      )}

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default ScanQR;
