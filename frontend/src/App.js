import './App.css';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('No image selected.');
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
      const extension = file.name.split('.').pop(); // Use file.name instead of image.name
      const acceptedTypes = ['png', 'jpg', 'jpeg', 'webp'];

      if (!acceptedTypes.includes(extension)) {
        setImage(null);  
        setError("Error: invalid file type. File must be a .png, .jpg, .jpeg, or .webp file.");
      } else {
        setImage(URL.createObjectURL(file));
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
        <button className="upload-button" type="button" onClick={handleButtonClick}>
          Upload image
        </button>
        {/*Input below is tied to button above*/}
        <input
          type="file"
          id="input"
          ref={fileInputRef}
          style={{ display: 'none' }}
          //accept=".png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
        />
        {image &&
          <img src={image} alt="Uploaded" className="img-preview uploaded-image" />
        }
        {/*!image &&
          <p>{error}</p>
        */}
        <p>{error}</p>
      </div>
    </div>
  </>);
}

export default App;
