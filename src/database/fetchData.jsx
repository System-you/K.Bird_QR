import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;

export const fetchData = async (qrCode, station, onScanFinished, closeModal) => {
  try {
    if (!apiKey || !API_URL) {
      throw new Error("API configuration is missing");
    }
    if (!qrCode || !station) {
      throw new Error("Please fill in all fields");
    }

    const timestamp = new Date().getTime();
    const url = `${API_URL}/qr-code?station=${station}&qrCode=${qrCode}&t=${timestamp}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    if (responseData?.data) {
      await onScanFinished(responseData.data);
    } else {
      throw new Error("Invalid data received");
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error(`Error: ${error.message || "Please scan the QR code again"}`);
    closeModal();
  }
};

export const handlePostData = async (data, station) => {
  
  try {
    const url = `${API_URL}/driver?partModel=${data.partmodel}&station=${station}&partId=${data.partId}&userId=${localStorage.getItem('username')}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      if (!response.ok) {
        const errorResult = await response.json();
        toast.error(errorResult.message || "เกิดข้อผิดพลาดระหว่างการสแกน QR Code สำหรับคนขับ ");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }

    const result = await response.json();
    toast.success(result.message || "อัพโหลดเรียบร้อย");
  } catch (error) {
    console.error("Error in handlePostData:", error.message);
    throw error;
  }
};

export const fetchPartModel = async (setFetchedData) => {
  const url = `${API_URL}/part-model`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const sortedData = data.sort((a, b) => a.part_model.localeCompare(b.part_model));
      localStorage.setItem('partModelData', JSON.stringify(sortedData));
      setFetchedData(sortedData);
    } else if (data && Array.isArray(data.data) && data.data.length > 0) {
      const sortedData = data.data.sort((a, b) => a.part_model.localeCompare(b.part_model));
      localStorage.setItem('partModelData', JSON.stringify(sortedData));
      setFetchedData(sortedData);
    } else {
      throw new Error("Data format is incorrect. Expected an array.");
    }
  } catch (error) {
    toast.error("Failed to fetch part model data");
  }
};

export const fetchPartModelMaterials = async (partModel, setMaterialsData) => {
  const timestamp = new Date().getTime();
  const url = `${API_URL}/driver?partModel=${partModel}&station=9&t=${timestamp}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    setMaterialsData(data.data || []);

  } catch (error) {
    toast.error("Failed to fetch part model materials");
  }
};