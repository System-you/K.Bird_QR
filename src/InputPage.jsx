import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InputPage = () => {
  const [username, setUsername] = useState('');
  const [station, setStation] = useState('');
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (!username || !station) {
      alert('Please fill in both username and station.');
      return;
    }
    navigate('/scan', { state: { username, station } });
  };

  return (
    <div>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <br />
      <label>
        Station:
        <input type="text" value={station} onChange={(e) => setStation(e.target.value)} />
      </label>
      <br />
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
};

export default InputPage;