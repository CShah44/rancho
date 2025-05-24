from typing import Union
from fastapi import FastAPI, HTTPException, Body
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
import time
import re

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
    max_attempts = 3
    attempt = 0
    last_error = None
    
    while attempt < max_attempts:
        attempt += 1
        try:
            # Generate a unique ID for this request
            request_id = str(uuid.uuid4())
            
            # Enhanced prompt with stricter requirements and better guidance
            prompt = f"""
                Generate Manim code to create a detailed, educational animation explaining this concept: {request.description}
                Use you creativity and artistic flair to make the animation visually appealing and engaging. At the same time
                the concepts should be clear and easy to understand. The animation should be suitable for educational purposes.

                STRICT REQUIREMENTS:
                1. The code MUST be complete, runnable, and error-free
                2. Use appropriate Manim constructs (MathTex, Text, etc.) with proper syntax
                3. Include step-by-step visual transitions that build understanding
                4. ALL elements MUST stay within the frame at all times
                5. Use a consistent, visually appealing color scheme with good contrast
                6. Text must be readable (appropriate size and duration on screen)
                7. Include at least 3-4 distinct scenes or concepts to ensure depth
                8. Add meaningful labels and annotations to clarify concepts
                9. The class name MUST be "ExplainConcept" and inherit from Scene
                
                The animation should be 40-60 seconds in length with smooth transitions.
                
                For the explanation:
                - Provide a concise but detailed explanation (150-250 words)
                - Highlight 3-5 key points illustrated in the visualization
                - Explain the educational value of specific visual elements
                - Use clear, direct language without unnecessary jargon
                
                DO NOT REFERENCE ANY EXTERNAL SVG OR IMAGE FILES.
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
            
            # Run Manim with the external directory
            result = subprocess.run(
                ["manim", "-qm", "--media_dir", media_dir, script_path, "ExplainConcept"],
                capture_output=True,
                text=True,
                cwd=temp_base_dir
            )
            
            if result.returncode != 0:
                raise Exception(f"Manim execution failed: {result.stderr}")

            # Find the generated video file using a glob pattern to match any video file in the 720p30 directory
            video_dir = os.path.join(media_dir, "videos", f"concept_{request_id}", "720p30")
            video_files = glob.glob(os.path.join(video_dir, "*.mp4"))
            
            if not video_files:
                raise Exception("No video file was generated")

            # Use the first video file found
            video_path = video_files[0]
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                video_path,
                resource_type="video",
                folder="concept_explanations"
            )
            
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
                "explanation": explanation,
                "attempts": attempt
            }
                
        except Exception as e:
            last_error = str(e)
            print(f"Attempt {attempt} failed: {last_error}")
            
            # Clean up any files that might have been created in this attempt
            try:
                if 'script_path' in locals() and os.path.exists(script_path):
                    os.remove(script_path)
                
                if 'video_files' in locals():
                    for video_file in video_files:
                        if os.path.exists(video_file):
                            os.remove(video_file)
            except:
                pass
            
            # Wait a short time before retrying
            if attempt < max_attempts:
                time.sleep(1)
    
    # If we've exhausted all attempts, raise an exception
    raise HTTPException(status_code=500, detail=f"Failed after {max_attempts} attempts. Last error: {last_error}")


class VideoRequest(BaseModel):
    video_url: str

@app.delete("/delete-video")
async def delete_video(request: VideoRequest):
    video_url = request.video_url
    try:
        # Extract the public_id from the Cloudinary URL
        # Cloudinary URLs typically look like: https://res.cloudinary.com/cloud_name/video/upload/v1234567890/folder/public_id.mp4
        match = re.search(r'upload/v\d+/(.+)\.\w+$', video_url)
        if not match:
            raise HTTPException(status_code=400, detail="Invalid Cloudinary URL format")
        
        public_id = match.group(1)
        
        # The public_id now includes the folder, e.g., "concept_explanations/bruwtqelu1kciogqze6z"
        # No need to add the folder prefix manually
        
        # Delete the video from Cloudinary
        result = cloudinary.uploader.destroy(public_id, resource_type="video")
        
        if result.get('result') != 'ok':
            raise HTTPException(status_code=500, detail=f"Failed to delete video: {result.get('result')}")
        
        return {"status": "success", "message": "Video deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting video: {str(e)}")
    
class GameRequest(BaseModel):
    title: str
    concept: str
    difficulty: str
    gameType: str
    instructions: str

@app.post("/generate-game")
async def generate_game(request: GameRequest):
    try:
        # Generate a unique ID for the game
        game_id = str(uuid.uuid4())
        
        # Generate p5.js code based on the parameters
        # This could use an LLM or templates
        p5js_code = generate_game_code(request.concept, request.difficulty, request.gameType, request.instructions)
        
        # Generate a preview image
        # preview_image_url = generate_preview_image(request.title, request.concept)
        
        # Store the game code in Cloudinary as a JSON file
        game_data = {
            "title": request.title,
            "concept": request.concept,
            "difficulty": request.difficulty,
            "gameType": request.gameType,
            "instructions": request.instructions,
            "description": p5js_code["game_description"],
            "code": p5js_code["game_code"],
            "id": game_id,
        }

        # Upload the game data to Cloudinary
        try:
            temp_file_path = os.path.join(tempfile.gettempdir(), f"game_{game_id}.json")
            with open(temp_file_path, 'w', encoding='utf-8') as temp_file:
                json.dump(game_data, temp_file)
            
            # Verify the file exists and has content
            if not os.path.exists(temp_file_path) or os.path.getsize(temp_file_path) == 0:
                raise Exception("Failed to create temporary file or file is empty")
            
            # Upload the temporary file to Cloudinary
            upload_result = cloudinary.uploader.upload(
                temp_file_path,
                resource_type="raw",
                folder="games",
                public_id=game_id
            )
            print(f"Game data uploaded to Cloudinary: {upload_result}")
        except Exception as e:
            print(f"Error uploading game data to Cloudinary: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload game data to Cloudinary")
        
        return {
            "game_id": game_id,
            # "preview_image_url": preview_image_url,
            "cloudinary_url": upload_result["secure_url"],
            "description": p5js_code["game_description"],
        }
    except Exception as e:
        print(f"Error generating game: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_game_code(concept, difficulty, game_type, instructions):
    
    prompt = f"""
        Create a simple educational game using Pygame to teach the concept: {concept}.
        Difficulty level: {difficulty}.
        Game type: {game_type}
        Instructions: {instructions}
        
        IMPORTANT REQUIREMENTS FOR PYGBAG COMPATIBILITY:
        1. The game must use asyncio and be compatible with Pygbag for web deployment
        2. Include the following imports: import asyncio, pygame, math, random, sys
        3. Structure the code with an async main() function
        4. Use the following template structure:
        
        ```python
        import asyncio
        import pygame
        import math
        import random
        import sys
        
        # Initialize pygame
        pygame.init()
        
        # Game constants
        WIDTH, HEIGHT = 800, 600
        FPS = 60
        
        # Define colors
        WHITE = (255, 255, 255)
        BLACK = (0, 0, 0)
        # Add more colors as needed
        
        # Create the screen
        screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("{concept} Learning Game")
        
        # Game variables and classes here
        
        async def main():
            # Game initialization
            clock = pygame.time.Clock()
            running = True
            
            # Game loop
            while running:
                # Handle events
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        running = False
                
                # Game logic
                
                # Drawing
                screen.fill(BLACK)
                
                # Your drawing code here
                
                pygame.display.flip()
                clock.tick(FPS)
                await asyncio.sleep(0)
            
            pygame.quit()
            
        asyncio.run(main())
        ```
        
        Do not reference any external files or images. Use simple shapes and colors.
        The game should be educational, teaching the concept of {concept} through interactive gameplay.
        Make sure the game is fully functional and error-free.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt, config={
            'response_mime_type': 'application/json',
            'response_schema': {
                "type": "object",
                "properties": {
                    "game_code": {
                        "type": "string"
                    },
                    "game_description": {
                        "type": "string"
                    },
                },
                "required": ["game_code", "game_description"]
            }
        }
    )

    json_response = json.loads(response.text)
    game_code = json_response["game_code"]
    game_description = json_response["game_description"]

    return {
        "game_code": game_code,
        "game_description": game_description
    }

def generate_preview_image(title, concept):
    # Generate a preview image using text
    # Could use another API or Cloudinary's text overlay features
    result = cloudinary.uploader.upload(
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        public_id=f"game_previews/{title.replace(' ', '_')}",
        transformation=[
            {"width": 600, "height": 400, "crop": "fill", "background": "auto"},
            {"overlay": {"font_family": "Arial", "font_size": 30, "text": title}},
            {"flags": "layer_apply", "gravity": "north", "y": 20}
        ]
    )
    return result["secure_url"]