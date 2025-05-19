import './App.css';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/test')
      .then(response => response.json())
      .then(data => setMessage(data.message));
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (<>
    <div className="">
      <header className="header">
        <p className="">
          Stefan Color Picker
        </p>
      </header>
    </div>
    
    <div className="main mt-[15px] flex flex-col gap-4">
      <p>
        API sample message: {message || "Loading..."} 
      </p>
      <button className="upload-button" type="button" onClick={handleButtonClick}>
        Upload image
      </button>
      {/*Input below is tied to button above*/}
      <div>
        <input
          type="file"
          id="input"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {image &&
          <img src={image} alt="Uploaded" className="img-preview uploaded-image" />
        }
        {!image &&
          <p>No image uploaded yet!</p>
        }
      </div>
    </div>
  </>);
}

export default App;
