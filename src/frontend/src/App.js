import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://gopal-apim-dev-eastus2.azure-api.net";

function App() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [resA, setResA] = useState(null);
  const [resB, setResB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (backend, file, setRes, setLoading) => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    setRes(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Backend A route: /v1/api/a/upload
      // Backend B route: /v1/api/b/upload
      const endpoint = backend === 'A' ? '/v1/api/a/upload' : '/v1/api/b/upload';
      
      const res = await axios.post(API_BASE_URL + endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setRes(res.data);
    } catch (error) {
      console.error('Upload failed', error);
      setRes({ error: 'Upload Failed. Check console for details.' });
    }
    setLoading(false);
  };

  return (
    <div className='app-container'>
      {/* --- Backend A Section --- */}
      <div className='split-pane pane-a'>
        <h1>Backend A</h1>
        <div className="upload-container">
          <input 
            type="file" 
            onChange={(e) => handleFileChange(e, setFileA)} 
            className="file-input"
          />
          <button 
            className='upload-btn btn-a' 
            onClick={() => handleUpload('A', fileA, setResA, setLoadingA)} 
            disabled={loadingA}
          >
            {loadingA ? 'Uploading...' : 'Upload to Backend A'}
          </button>
        </div>
        {resA && <pre>{JSON.stringify(resA, null, 2)}</pre>}
      </div>

      {/* --- Backend B Section --- */}
      <div className='split-pane pane-b'>
        <h1>Backend B</h1>
        <div className="upload-container">
          <input 
            type="file" 
            onChange={(e) => handleFileChange(e, setFileB)} 
            className="file-input"
          />
          <button 
            className='upload-btn btn-b' 
            onClick={() => handleUpload('B', fileB, setResB, setLoadingB)} 
            disabled={loadingB}
          >
            {loadingB ? 'Uploading...' : 'Upload to Backend B'}
          </button>
        </div>
        {resB && <pre>{JSON.stringify(resB, null, 2)}</pre>}
      </div>
    </div>
  );
}

export default App;