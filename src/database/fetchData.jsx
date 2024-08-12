import toast from "react-hot-toast";
import { debounce } from 'lodash';


const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;


export const fetchData = debounce(async (qrCode, station, setLoading, setFetchedData, setError, closeModal) => {
  setLoading(true);
  try {
    if (!apiKey) {
      throw new Error("API key is missing");
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

    setFetchedData(responseData.data);

  } catch (error) {
    console.error("Error fetching data:", error);
    setError(error.message);
    toast.error(`Please scan the QR code again`);
    closeModal();
  } finally {
    setLoading(false);
  }
}, 1000);

export const handlePostData = async (fetchedData, station, username, selectedStatus, setLoading) => {
  try {
    setLoading(true);
    const url = `${API_URL}/qr-code?partmodel=${fetchedData.partmodel}&partId=${fetchedData.partId}&station=${station}&empName=${username}&status=${selectedStatus}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("POST Result:", result);
    toast.success(result.message || "อัพโหลดเรียบร้อย");

  } catch (error) {
    console.error("Error in handlePostData:", error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};

export const fetchPartModel = async (setLoading, setFetchedData, setError) => {
  const url = `${API_URL}/part-model`;
  try {
    setLoading(true);
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
    console.error("Error fetching part model:", error);
    setError(error.message);
    toast.error("Failed to fetch part model data");
  } finally {
    setLoading(false);
  }
};


export const fetchPartModelMaterials = async (partModel, station, setLoading, setMaterialsData, setError) => {
  const timestamp = new Date().getTime();
  const url = `${API_URL}/part-model/materials?partmodel=${partModel}&station=${station}&t=${timestamp}`;
  try {
    setLoading(true);
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
    console.log("Fetched Materials Data:", data);

    setMaterialsData(data.data || []);

  } catch (error) {
    console.error("Error fetching part model materials:", error);
    setError(error.message);
    toast.error("Failed to fetch part model materials");
  } finally {
    setLoading(false);
  }
};