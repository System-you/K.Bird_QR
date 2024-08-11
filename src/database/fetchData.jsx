import toast from "react-hot-toast";
const API_URL =  "https://3459-2403-6200-8882-21fa-3d94-36af-f490-9625.ngrok-free.app"
const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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
    console.log("URL:", url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey, // Add API key from .env
      },
    });
    console.log("Response:", response);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Response data:", responseData);

    setFetchedData(responseData.data); // Access the "data" property

  } catch (error) {
    console.error("Error fetching data:", error);
    setError(error.message);
    toast.error(`Please scan the QR code again`);
    closeModal();
  } finally {
    setLoading(false);
  }
}, 1000); // Adjust the debounce delay as needed

export const handlePostData = async (fetchedData, station, username, selectedStatus, setLoading) => {
  setLoading(true);
  try {
    const part_model = fetchedData["partmodel"];
    const part_id = parseInt(fetchedData["partId"]);
    const part_station = parseInt(station);
    const emp_name = username;
    const part_status = selectedStatus;

    console.log("Updating with Part Model:", part_model);
    console.log("Updating with Part ID:", part_id);
    console.log("Updating with Part Station:", part_station);
    console.log("Updating with Employee Name:", emp_name);
    console.log("Updating with Part Status:", part_status);
    const timestamp = new Date().getTime();
    const url = `${API_URL}/qr-code?partmodel=${part_model}&partId=${part_id}&station=${part_station}&empName=${emp_name}&status=${part_status}&t=${timestamp}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey, // Add API key from .env
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    // toast.success("QR Code updated successfully");
    console.log("Update Result:", result);

  } catch (error) {
    toast.error("Error updating QR Code. Please try again.");
    console.error("Error updating QR Code:", error.message);
  } finally {
    setLoading(false);
  }
};
