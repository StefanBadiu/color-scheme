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

        image_array = np.array(img)
        logging.info("Image converted to array: %s", image_array.shape)
        logging.info("Dimensions in image: %s", image_array.shape[2])

        colors = {}

        for x in range(image_array.shape[0]):
            for y in range(image_array.shape[1]):
                # logging.info("image_array[x][y]: %s", image_array[x][y])
                if str(image_array[x][y]) not in colors:
                    colors[str(image_array[x][y])] = 1
                    # logging.info("one")
                else:
                    colors[str(image_array[x][y])] += 1
                    # logging.info("two")

        logging.info("colors: %s", colors)
    except Exception as e:
        logging.info(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    return {"message": colors}