from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import logging
    
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logging.basicConfig(level=logging.INFO)
    
@app.get("/api/test")
async def hello():
    return {"message": "Testing!"}

@app.post("/api/colorscheme")
async def colorscheme(file: UploadFile = File(...), colorCount: int = Form(...)):
    try:
        logging.info("Received file: %s", file.filename)
        logging.info("Requested color count: %d", colorCount)
        
        img = Image.open(file.file)
        logging.info("Image opened successfully.")

        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
            logging.info("Image converted to RGB mode.")

        img = img.quantize(colors=128)
        palette = img.getpalette()
        logging.info("Palette retrieved successfully.")

        image_array = np.array(img)
        logging.info("Image converted to array: %s", image_array.shape)

        colors = {}

        if len(image_array.shape) == 2: 
            for x in range(image_array.shape[0]):
                for y in range(image_array.shape[1]):
                    pixel = image_array[x][y]
                    rgb = str(tuple(palette[pixel * 3:pixel * 3 + 3]))  # Extract RGB values
                    if rgb not in colors:        
                        colors[rgb] = 1
                    else:
                        colors[rgb] += 1
        else:
            raise ValueError("Unexpected image array shape: %s" % str(image_array.shape))

        logging.info("Colors extracted: %s", colors)
    except Exception as e:
        logging.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    return {"message": colors}