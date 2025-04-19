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
            Generate exceptional, flawless Manim code to create a visually stunning animation explaining this concept: {request.description}
            
            CRITICAL REQUIREMENTS:
            1. The code MUST be complete, runnable, and bug-free
            2. The animation MUST be intuitive, creative, and educational
            
            VISUAL DESIGN GUIDELINES:
            1. Frame awareness: Ensure all elements stay within the frame boundaries
            - Use appropriate scaling for objects
            - Position elements with sufficient margins from frame edges
            - Test coordinates to prevent objects from being cut off
            
            2. Prevent overlapping elements:
            - Maintain proper spacing between text and objects
            - Use strategic positioning and timing for elements
            - Implement clear visual hierarchy
            
            3. Visual clarity and aesthetics:
            - Use a consistent, visually pleasing color palette (avoid default colors)
            - Implement proper text sizing and font choices for readability
            - Add subtle background elements or grids when appropriate
            - Use smooth transitions and animations with appropriate run_time values
            
            4. Educational effectiveness:
            - Break complex concepts into sequential, logical steps
            - Use clear labels, annotations, and callouts
            - Implement highlighting techniques to draw attention to key points
            - Include visual metaphors and analogies when possible
            
            5. Technical excellence:
            - Use appropriate Manim constructs (MathTex, Text, etc.)
            - Implement proper waiting times between animations for comprehension
            - Group related elements using VGroup when appropriate
            - Use camera movements thoughtfully (zooming, panning)
            
            IMPORTANT: The animation should be 30-60 seconds in length, focused on clarity and impact.
            
            Give a detailed explanation of the visualization and how it relates to the concept.
            Return only the Python code without any explanations or markdown.
            The user should not know about manim do not mention it. Just talk about the concepts and address as visualization.
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
