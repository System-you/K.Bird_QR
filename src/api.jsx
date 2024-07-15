import React, { useEffect, useState } from "react";

const ApiComponent = ({ qrCode, closeModal, updateQrStatus, status }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(status || "");

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };
  
  const handleConfirm = () => {
    updateQrStatus(qrCode, selectedStatus);
    closeModal();
  };

  if (!qrCode) {
    return null; // Don't render anything if qrCode is not provided
  }

  return (
    <div className="api-modal">
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          <p>QR Code: {qrCode}</p>
          <p>Part ID: {data["Part Id"]}</p>
          <p>Part Model: {data["Part Model"]}</p>
          <p>ชื่อเฟอร์นิเจอร์: {data["ชื่อเฟอร์นิเจอร์"]}</p>
          <p>ตำแหน่งชิ้นงาน: {data["ตำแหน่งชิ้นงาน"]}</p>
          <p>ความหนา: {data["ความหนา"]}</p>
          <p>ความกว้าง: {data["ความกว้าง"]}</p>
          <p>ความยาว: {data["ความยาว"]}</p>
          <p>ชื่อวัสดุ: {data["ชื่อวัสดุ"]}</p>
          <label>
            Status:
            <select value={selectedStatus} onChange={handleStatusChange}>
              <option value="">Select Status</option>
              <option value="A-สำเร็จ">A-สำเร็จ</option>
              <option value="B-เสีย">B-เสีย</option>
              <option value="C-รับชิ้นงานแล้ว">C-รับชิ้นงานแล้ว</option>
              <option value="D-ส่งแล้ว">D-ส่งแล้ว</option>
            </select>
          </label>
          <div className="modal-buttons">
            <button onClick={handleConfirm}>OK</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiComponent;