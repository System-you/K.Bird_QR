import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const HiddenMessage = ({ message }) => {
  const [showMessage, setShowMessage] = useState(false);

  function handleToggleMessage() {
    setShowMessage(!showMessage);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {message}
      <button onClick={handleToggleMessage}>
        {showMessage ? <FaEye /> : <FaEyeSlash />}
      </button>
    </div>
  );
};

export default HiddenMessage;
