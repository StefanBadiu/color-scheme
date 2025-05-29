from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from collections import Counter
import numpy as np
import logging
from fastapi.responses import StreamingResponse
from io import BytesIO
from math import sqrt
import ast
    
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logging.basicConfig(level=logging.INFO)

def color_dist(c1, c2):
    c1 = ast.literal_eval(c1)
    c2 = ast.literal_eval(c2)
    #logging.info("c1: %s, c2: %s", c1, c2)
    return sqrt((float(c1[0]) - float(c2[0])) ** 2 +
                (float(c1[1]) - float(c2[1])) ** 2 +
                (float(c1[2]) - float(c2[2])) ** 2)

def filter_colors(colors, min_distance):
    logging.info("Colors input: %s", colors)
    filtered = []
    for color, count in colors:
        if all(color_dist(color, existing_color) >= min_distance for existing_color, _ in filtered):
            filtered.append((color, count))
    logging.info("Filtered colors: %s", filtered)
    return filtered
    
@app.get("/api/test")
async def hello():
    return {"message": "Testing!"}

@app.post("/api/quantize")
async def quantize(file: UploadFile = File(...), q: int = Form(...)):
    try:
        logging.info("Received file: %s", file.filename)
        
        img = Image.open(file.file)
        logging.info("Image opened successfully.")

        if img.mode not in ("RGB"):
            # fix for transparent (RGBA) images
            img.load()
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3]) # 3 is the alpha channel

            background.save('foo.jpg', 'JPEG', quality=80)
            img = background
            logging.info("Image converted to RGB mode.")

        img = img.quantize(colors=q)
        logging.info("Image quantized successfully.")

        # Convert the quantized image to a byte stream
        img_byte_array = BytesIO()
        img.save(img_byte_array, format="PNG")
        img_byte_array.seek(0)
        logging.info(StreamingResponse(img_byte_array, media_type="image/png"))

        return StreamingResponse(img_byte_array, media_type="image/png")
    except Exception as e:
        logging.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

@app.post("/api/colorscheme")
async def colorscheme(file: UploadFile = File(...), colorCount: int = Form(...), q: int = Form(...)):
    distance = 100
    
    try:
        logging.info("Received file: %s", file.filename)
        logging.info("Requested color count: %d", colorCount)
        
        img = Image.open(file.file)
        logging.info("Image opened successfully.")

        if img.mode not in ("RGB"):
            # fix for transparent (RGBA) images
            img.load()
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3]) # 3 is the alpha channel

            background.save('foo.jpg', 'JPEG', quality=80)
            img = background
            logging.info("Image converted to RGB mode.")

        img = img.quantize(colors=q)
        palette = img.getpalette()
        #logging.info("Palette retrieved successfully.")
        logging.info("Palette length: %d", (len(palette)))
        #logging.info("First 10 palette values: %s", palette[:30])  # Log the first 10 RGB values

        image_array = np.array(img)
        logging.info("Image converted to array: %s", image_array.shape)
        #logging.info("Unique pixel values in image array: %s", np.unique(image_array))

        colors = {}

        if len(image_array.shape) == 2: 
            for x in range(image_array.shape[0]):
                for y in range(image_array.shape[1]):
                    pixel = int(image_array[x][y])
                    if 0 <= pixel < 256 and len(palette) >= (pixel * 3 + 3): 
                        rgb_tuple = tuple(palette[pixel * 3:pixel * 3 + 3])  # Extract RGB values
                        if len(rgb_tuple) == 3:  # Check if valid RGB tuple
                            rgb = str(rgb_tuple)
                            if rgb not in colors:        
                                colors[rgb] = 1
                            else:
                                colors[rgb] += 1
                        else:
                            logging.warning(f"Invalid RGB tuple for pixel {pixel}: {rgb_tuple}")
        else:
            raise ValueError("Unexpected image array shape: %s" % str(image_array.shape))

        # Sort colors by frequency
        #logging.info("Colors UNsorted: %s", colors)
        sorted_colors = []
        if distance > 0:
            colors_list = [(key, value) for key, value in colors.items()]
            colors_list = Counter(dict(colors_list)).most_common()
            filtered_colors = filter_colors(colors_list, distance)
            sorted_colors = Counter(dict(filtered_colors)).most_common(colorCount)
        else:
            sorted_colors = Counter(colors).most_common(colorCount)
        #logging.info("Colors sorted: %s", sorted_colors)
    except Exception as e:
        logging.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    return {"message": sorted_colors}