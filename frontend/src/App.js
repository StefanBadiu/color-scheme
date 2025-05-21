import './App.css';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imageFileName, setImageFileName] = useState('No image selected.');
  const [error, setError] = useState('No image selected.');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/test')
      .then(response => response.json())
      .then(data => setMessage(data.message));
  }, []);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const acceptedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']; // Validate using MIME types

      if (!acceptedTypes.includes(file.type)) {
        setImage(null);
        setImageFileName('No image selected.');
        setError("Error: invalid file type. File must be a .png, .jpg, .jpeg, or .webp file.");
      } else {
        setImage(URL.createObjectURL(file));
        setImageFileName(file.name);
        setError("no error");
      }
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
      <div className="flex flex-row items-center gap-4">
        <input
          type="file"
          id="input"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {image &&
          <div className="flex flex-col">
            <img src={image} alt="Uploaded" className="img-preview uploaded-image" />
            <p className="subtext">{imageFileName}</p>
          </div>
        }
        {!image &&
          <p>{error}</p>
        }
        <button className="upload-button" type="button" onClick={handleButtonClick}>
          Upload image
        </button>
      </div>
    </div>
  </>);
}

export default App;
