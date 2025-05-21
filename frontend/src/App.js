import './App.css';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imageFileName, setImageFileName] = useState('No image selected.');
  const [error, setError] = useState('No image selected.');
  const [colors, setColors] = useState(null);
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

  const colorScheme = async () => {
    console.log("COLOR SCHEME !!");
    const colorCount = document.getElementById("colors").value;
    if (!image || !colorCount) {
      setError("Please upload an image and enter a valid number.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);
      formData.append("colorCount", colorCount);

      const response = await fetch("http://127.0.0.1:8000/api/colorscheme", {
        method: "POST",
        body: formData,
      });

      console.log(response);

      if (!response.ok) {
        console.log("LOL");
        throw new Error("Failed to fetch color scheme.");
      }

      const data = await response.json();
      setColors(data);
      console.log("Color Scheme:", data); // Log the response
    } catch (err) {
      setError(err.message);
    }
  }

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
        <button className="button" type="button" onClick={handleButtonClick}>
          Upload image
        </button>
      </div>
      <div>
        <label for="colors">Number of colors (1-10): </label>
        <input className="border" type="number" id="colors" name="colors" min="1" max="10" />
      </div>
      <button className="button" type="button" onClick={colorScheme}>
        Get my color scheme!
      </button>
      <div>
        {colors && colors.message.length > 0 ? ( // Check if colors exist
          <div>
            <p>Extracted Colors:</p>
            <ul>
              {colors.message.map(([rgb, count], index) => (
                <li key={index}>
                  <span
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      backgroundColor: `rgb${rgb}`,
                      marginRight: "10px",
                    }}
                  ></span>
                  {rgb}: {count} occurrences
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No colors extracted yet.</p>
        )}
      </div>
    </div>
  </>);
}

export default App;
