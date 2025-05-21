from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
    
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
    
@app.get("/api/test")
async def hello():
    return {"message": "Testing!"}

@app.post("/api/colorscheme")
async def colorscheme(file: UploadFile = File(...), colorCount: int = Form(...)):
    try:
        img = Image.open(file.file)
        # Sample
        colors = ["#FF5733", "#33FF57", "#3357FF"][:colorCount]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

    return {"message": f"COLOR SCHEME (API version) !! colors in image = {colors}"}