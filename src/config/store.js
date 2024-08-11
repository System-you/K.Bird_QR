import { create } from 'zustand';
import toast from "react-hot-toast";

const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
const API_URL = "https://3459-2403-6200-8882-21fa-3d94-36af-f490-9625.ngrok-free.app";

const useUserStore = create((set) => ({
  username: '',
  password: '',
  station: '',
  userData: {},
  fetchedData: null,
  loading: false,
  error: null,
  
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setStation: (station) => set({ station }),
  setUserData: (userData) => set({ userData }),
  setFetchedData: (fetchedData) => set({ fetchedData }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchData: async (qrCode, station, closeModal) => {
    set({ loading: true, error: null });
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
      set({ fetchedData: responseData.data });
    } catch (error) {
      set({ error: error.message });
      toast.error(`Please scan the QR code again`);
      closeModal();
    } finally {
      set({ loading: false });
    }
  },

  handlePostData: async (station, username, selectedStatus) => {
    const { fetchedData, setLoading } = useUserStore.getState();
    setLoading(true);
    try {
      const part_model = fetchedData["partmodel"];
      const part_id = parseInt(fetchedData["partId"]);
      const part_station = parseInt(station);
      const emp_name = username;
      const part_status = selectedStatus;

      const timestamp = new Date().getTime();
      const url = `${API_URL}/qr-code?partmodel=${part_model}&partId=${part_id}&station=${part_station}&empName=${emp_name}&status=${part_status}&t=${timestamp}`;

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
      toast.success("QR Code updated successfully");
      console.log("Update Result:", result);
    } catch (error) {
      toast.error("Error updating QR Code. Please try again.");
      console.error("Error updating QR Code:", error.message);
    } finally {
      setLoading(false);
    }
  },
}));

export default useUserStore;
