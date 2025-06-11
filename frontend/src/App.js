import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import loadingGif from './Images/loading.gif';

function hexToRGB(h) {
  let r = 0, g = 0, b = 0;

  if (h.length === 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];
  } else if (h.length === 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }
  
  return "rgb("+ +r + "," + +g + "," + +b + ")";
}

function rgbToHex(r) {
  console.log(r);
  r = r.toString();
  const s = r.substring(1, r.indexOf(')')).split(", ");
  return "#" + parseInt(s[0]).toString(16) + parseInt(s[1]).toString(16) + parseInt(s[2]).toString(16);
}

function rgbStringToArray(rgb) {
  const values = rgb.match(/(\d+)/g); // Extract numbers
  if (!values || values.length !== 3) {
    return null; // Or handle invalid input as needed
  }
  return values.map(Number); // Convert strings to numbers
}

function App() {
  //const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imageFileName, setImageFileName] = useState('No image selected.');
  const [error, setError] = useState('No image selected.');
  const [colors, setColors] = useState(null);
  const [mainColor, setMainColor] = useState(hexToRGB("#61dafb"));
  const [quantizeSample, setQuantizeSample] = useState(null);
  const [advancedSettingsText, setAdvancedSettingsText] = useState("Advanced Settings ↓");
  const [loading, setLoading] = useState(false);
  const [colorView, setColorView] = useState("card"); // "card" or "thin"
  const fileInputRef = useRef(null);

  /*useEffect(() => {
    fetch('http://127.0.0.1:8000/api/test')
      .then(response => response.json())
      .then(data => setMessage(data.message));
  }, []);*/

  useEffect(() => { 
    document.getElementById("colors").defaultValue = "10";
    document.getElementById("distance").defaultValue = "10";
    document.getElementById("q").defaultValue = "256";
  }, []);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);
  
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--main-color', "" + mainColor + "");
    console.log("Main color is now: " + mainColor);

    const text = rgbStringToArray(mainColor);
    let textColor = null;
    if (text) {
      const [r, g, b] = text;
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      textColor = brightness > 186 ? "black" : "white";
    }
    root.style.setProperty('--bg-text-color', "" + textColor + "");
  }, [mainColor]);

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
        setError(null);
      }
    }
  };

  const quantize = async () => {
    console.log("QUANTIZE !!");
    const colorCount = document.getElementById("colors").value;
    const quantizationLevel = document.getElementById("q").value;
    const distance = document.getElementById("distance").value;
    if (!image) {
      setError("Please upload an image.");
      return;
    } else if (!colorCount || !distance) {
      setError("Please fill in all fields.");
      return;
    } else if (!quantizationLevel) {
      setError("Please fill in all fields under \"Advanced Settings\".");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);
      formData.append("q", quantizationLevel);

      const response = await fetch("http://127.0.0.1:8000/api/quantize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.log("OOPS!");
        throw new Error("Failed to fetch quantized image.");
      }

      console.log(response || "NO RESPONSE");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setQuantizeSample(imageUrl);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const colorScheme = async () => {
    console.log("COLOR SCHEME !!");
    const colorCount = document.getElementById("colors").value;
    const quantizationLevel = document.getElementById("q").value;
    const distance = document.getElementById("distance").value;
    if (!image) {
      setError("Please upload an image.");
      return;
    } else if (!colorCount || !distance) {
      setError("Please fill in all fields.");
      return;
    } else if (!quantizationLevel) {
      setError("Please fill in all fields under \"Advanced Settings\".");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);
      formData.append("colorCount", colorCount);
      formData.append("q", quantizationLevel);
      formData.append("distance", distance);

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
      console.log("Color Scheme:", data);

      let mainColor = data.message[0][0];
      if (mainColor === "(255, 255, 255)") {
        mainColor = data.message[1][0];
      }
      console.log(mainColor);
      setMainColor(`rgb${mainColor}`);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const toggleAdvancedSettings = () => {
    const advancedSettings = document.querySelector('.advanced-settings');
    if (advancedSettings.classList.contains('expanded')) { // COLLAPSE SETTINGS:
      setAdvancedSettingsText("Advanced Settings ↓");
      advancedSettings.style.height = `${advancedSettings.scrollHeight}px`;
      requestAnimationFrame(() => {
        advancedSettings.style.height = '0';
      });
      advancedSettings.addEventListener(
        'transitionend',
        () => {
          advancedSettings.classList.remove('expanded');
          advancedSettings.style['border-width'] = `0px`; 
        },
        { once: true }
      );
    } else { // EXPAND SETTINGS:
      setAdvancedSettingsText("Advanced Settings ↑");
      advancedSettings.style.height = `${advancedSettings.scrollHeight}px`;
      advancedSettings.style['border-width'] = `1px`; 
      advancedSettings.classList.add('expanded');
      advancedSettings.addEventListener(
        'transitionend',
        () => {
          advancedSettings.style.height = 'auto'; 
        },
        { once: true }
      );
    }
  };

  const expandImage = () => {
    if (image) {
      var modal = document.getElementById("imageModal");
      modal.style.display = "flex";
    }
  }

  const collapseImage = () => {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none";
  }

  useEffect(() => {
    var modal = document.getElementById("loadingModal");
    if (loading) {
      modal.style.display = "flex";
    } else {
      modal.style.display = "none";
    }
  }, [loading]);

  return (<>
    <div className="">
      <header className="header">
        <p className="">
          Stefan Color Picker (returned colors CSS experimentation)
        </p>
      </header>
    </div>

    <div id="imageModal" class="modal">
      <div class="modal-content">
        <span className="close-modal" onClick={collapseImage}>&times;</span>
        <img src={image} alt="Uploaded image, expanded" className="modal-img" />
      </div>
    </div> 

    <div id="loadingModal" class="modal">
      <div class="modal-content">
        <img src={loadingGif} alt="Loading symbol" className="modal-img" />
        <p className='subtext'>Loading...<br></br></p>
        <p className='subtext'>Larger images may take a while.</p>
      </div>
    </div> 
    
    <div className="main flex flex-col gap-4">
      <div className="input-container flex flex-col items-center gap-4">
        <div className="flex flex-row items-center gap-4 mt-[15px]">
          <input
            type="file"
            id="input"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {image &&
            <div className="flex flex-col">
              <img 
                src={image} 
                alt="Uploaded" 
                onClick={expandImage}
                className="img-preview uploaded-image" 
              />
              <p className="subtext">{imageFileName}</p>
            </div>
          }
          <button className="button" type="button" onClick={handleButtonClick}>
            Upload image
          </button>
        </div>
        <div className="subtext mb-2">
          {error}
        </div>
        <div>
          <label for="colors">Number of colors (1-128): </label>
          <input className="border" type="number" id="colors" name="colors" min="1" max="128" />
        </div>
        <div>
          <label for="q">Minimum color difference (0-100): </label>
          <input className="border" type="number" id="distance" name="distance" min="0" max="100" />
        </div>
        <div className="flex flex-col items-center">
          <button className="button" type="button" onClick={toggleAdvancedSettings}>
            {advancedSettingsText}
          </button>
          <div className="advanced-settings flex flex-col items-center gap-4">
            <div>
              <label for="q">Color quantization (1-256): </label>
              <input className="border" type="number" id="q" name="q" min="1" max="256" />
            </div>
            <p className="subtext ml-2 mr-2">A lower color quantization level should increase the variety of colors shown, but may be slightly less accurate.<br></br>If you don't understand what this means, it may be better to leave this option untouched. (Would not recommend going below 64 in most cases.)</p>
            <p className="subtext ml-2 mr-2">TIP: If your image is large or has a wide variety of colors, consider cropping a specific, important part of it for better results.</p>
            <button className="button mb-2" type="button" onClick={quantize}>
              Quantize
            </button>
            {quantizeSample && (
              <div>
                <p>Quantized Image:</p>
                <img src={quantizeSample} alt="Quantized" className="img-preview mb-2" />
              </div>
            )}
          </div>
        </div>
        <button className="button mb-[15px]" type="button" onClick={colorScheme}>
          Get my color scheme!
        </button>
      </div>
      <div className='mb-4'>
        {colors && colors.message.length > 0 ? ( // Check if colors exist
          <div className="flex flex-col items-center">
            <h1>Extracted Colors:</h1>
            <div className="flex items-center gap-2 mb-4">
              <p className='subtext'>Card View</p>
              <label className="toggle" for="my-toggle">
                <input id="my-toggle" className="toggle__input" type="checkbox" onClick={
                  () => {
                    setColorView(colorView === "card" ? "thin" : "card");
                  }
                }/>
                <div className="toggle__slider"></div>
              </label>
              <p className='subtext'>Thin View</p>
            </div>
            <div className="color-display">
              {colorView === "card" ? ( // Card view
                colors.message.map(([rgb, count], index) => (
                  <div className="color-item" key={index}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "100%",
                        height: "100%",
                        backgroundColor: `rgb${rgb}`,
                        border: "1px solid #000",
                      }}
                    ></span>
                    <p className="subtext">
                      rgb{rgb}
                    </p>
                    <p className="subtext">
                      {rgbToHex(rgb)} 
                    </p>
                    <p className="subsubtext">
                      ({count} occurrences)
                    </p>
                  </div>
                ))
              ) : ( // Thin view
                <div className="flex flex-col items-center">
                  <ul>
                    {colors.message.map(([rgb, count], index) => (
                      <li className="flex flex-row justify-between items-center gap-4 w-full" key={index}>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              display: "inline-block",
                              width: "20px",
                              height: "20px",
                              backgroundColor: `rgb${rgb}`,
                              border: "1px solid #000",
                            }}
                          ></span>
                          rgb{rgb} / {rgbToHex(rgb)}
                        </div>
                        <p className="subtext">({count} occurrences)</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p>No colors extracted yet.</p>
        )}
      </div>
    </div>
  </>);
}

export default App;
