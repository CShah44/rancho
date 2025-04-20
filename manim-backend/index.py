from typing import Union
from fastapi import FastAPI, HTTPException
from google import genai
from google.genai import types
import os
import subprocess
import tempfile
import cloudinary
import cloudinary.uploader
from pydantic import BaseModel
import uuid
import json
import dotenv
import glob

dotenv.load_dotenv()

app = FastAPI()

# Initialize Gemini client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Initialize Cloudinary
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET")
)

class ConceptRequest(BaseModel):
    description: str

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/explain-concept")
async def explain_concept(request: ConceptRequest):
    try:
        # Generate a unique ID for this request
        request_id = str(uuid.uuid4())
        
        # Use Gemini to generate Manim code
        prompt = f"""
            Generate Manim code to create an animation explaining this concept: {request.description}
            
            Requirements:
            1. The code must be complete and runnable
            2. Use appropriate Manim constructs (MathTex, Text, etc.)
            3. Keep animations clear and educational
            4. Ensure all elements stay within the frame
            5. Use appropriate colors and text sizes
            
            The animation should be 30-60 seconds in length.
            
            Return only the Python code without any explanations or markdown.
            Also provide a brief explanation of the visualization. Address the animation as visualization in explanation.
        """
    
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt, config={
                'response_mime_type': 'application/json',
                'response_schema':  {
                    "type": "object",
                    "properties": {
                        "python_code": {
                            "type": "string"
                        },
                        "explanation": {
                            "type": "string"
                        }
                    },
                    "required": ["python_code", "explanation"]
                }
            }
        )

        json_response = json.loads(response.text)

        # Extract the generated code from the response
        python_code = json_response["python_code"]
        explanation = json_response["explanation"]
    
        # Create files in a directory outside the project structure to avoid reload issues
        temp_base_dir = os.path.join(os.path.expanduser("~"), "manim_temp")
        os.makedirs(temp_base_dir, exist_ok=True)
        script_path = os.path.join(temp_base_dir, f"concept_{request_id}.py")
        with open(script_path, "w") as f:
            f.write(python_code)
        
        # Create media directory in the same external location
        media_dir = os.path.join(temp_base_dir, "media")
        os.makedirs(media_dir, exist_ok=True)

        # print("Now manim will run")
        
        # Run Manim with the external directory
        result = subprocess.run(
            ["manim", "-qm", "--media_dir", media_dir, script_path, "ExplainConcept"],
            capture_output=True,
            text=True,
            cwd=temp_base_dir
        )

        # print("manim ran")
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Manim execution failed: {result.stderr}")
        
        # print("manim ran successfully")

        # Find the generated video file using a glob pattern to match any video file in the 720p30 directory
        video_dir = os.path.join(media_dir, "videos", f"concept_{request_id}", "720p30")
        video_files = glob.glob(os.path.join(video_dir, "*.mp4"))
        
        if not video_files:
            raise HTTPException(status_code=500, detail="No video file was generated")
        
        # print(f"Found video files: {video_files}")

        # Use the first video file found
        video_path = video_files[0]

        # print(f"Using video path: {video_path}")
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            video_path,
            resource_type="video",
            folder="concept_explanations"
        )

        # print(f"Upload result: {upload_result}")
        
        # Cleanup the generated files
        os.remove(script_path)
        for video_file in video_files:
            try:
                os.remove(video_file)
            except:
                pass
        
        # Return the URL of the uploaded video
        return {
            "video_url": upload_result["secure_url"],
            "explanation": explanation
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
