import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
    
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/test')
      .then(response => response.json())
      .then(data => setMessage(data.message));
  }, []);

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
      <button class="upload-button" type="button">Upload image</button>
      <input type="file" id="input"></input>
      {image &&
        <img src={image} alt="Uploaded" className="uploaded-image" />
      }
      {!image &&
        <p>No image uploaded yet!</p>
      }
    </div>
  </>);
}

export default App;
