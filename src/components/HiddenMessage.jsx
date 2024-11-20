import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const HiddenMessage = ({ message }) => {
  const [showMessage, setShowMessage] = useState(false);

  function handleToggleMessage() {
    setShowMessage(!showMessage);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', color: 'black' }}>
      <span>{showMessage ? message : ""}</span>
      <button
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          color: 'black',
          marginLeft: '10px' // Optional: Add some space between the message and the button
        }}
        onClick={handleToggleMessage}
      >
        {showMessage ? <FaEye /> : <FaEyeSlash />}
      </button>
    </div>
  );
};

export default HiddenMessage;
