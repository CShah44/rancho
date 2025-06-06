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
import asyncio

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
    voice_type: str = "male"  # male, female, or child
    speech_speed: float = 1.0  # 0.5 to 2.0

@app.get("/")
def read_root():
    return {"Hello": "World"}

def generate_audio_script_from_video(video_path: str, description: str) -> tuple[str, str]:
    """Generate a script for audio narration based on the rendered video."""
    try:
        # Upload video to Gemini
        uploaded_file = client.files.upload(file=video_path)
        
        prompt = f"""
        Analyze this educational animation video and create a clear, engaging audio script for narration.
        The animation was created on the basis of the following concept: {description}.

        Requirements:
        - Watch the video carefully and understand the visual elements, transitions, and educational content
        - Create a script that complements and explains what's happening visually
        - The script timing should match the video duration
        - Use simple, clear language appropriate for students
        - Include natural pauses and transitions that align with visual changes
        - Make it engaging and educational
        - Avoid technical jargon unless necessary
        - The narration should enhance understanding of the visual content
        - The script should be as concise as possible
        
        Return only the script text without any formatting or metadata.
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[uploaded_file, prompt]
        )
        
        script = response.text.strip()
        file_name = uploaded_file.name
        
        return script, file_name
        
    except Exception as e:
        raise Exception(f"Error generating audio script from video: {str(e)}")

def cleanup_gemini_file(file_name: str):
    """Clean up uploaded file from Gemini."""
    try:
        client.files.delete(name=file_name)
        print(f"Successfully deleted Gemini file: {file_name}")
    except Exception as e:
        print(f"Warning: Could not delete Gemini file {file_name}: {str(e)}")

async def generate_audio_with_edge_tts_async(text: str, voice: str = "en-US-AriaNeural", output_path: str = None) -> str:
    """Generate audio using Edge TTS (free Microsoft service) - async version."""
    try:
        import edge_tts
        
        if output_path is None:
            output_path = os.path.join(tempfile.gettempdir(), f"audio_{uuid.uuid4()}.mp3")
        
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)
        
        return output_path
    except ImportError:
        raise Exception("edge-tts package not installed. Run: pip install edge-tts")
    except Exception as e:
        raise Exception(f"Error generating audio with Edge TTS: {str(e)}")

def generate_audio_with_edge_tts(text: str, voice: str = "en-US-AriaNeural", output_path: str = None) -> str:
    """Generate audio using Edge TTS (free Microsoft service) - sync wrapper."""
    try:
        # Clean text to avoid encoding issues
        clean_text = text.encode('ascii', 'ignore').decode('ascii')
        if not clean_text.strip():
            clean_text = text  # Fallback to original if cleaning removes everything
            
        # Try to run in existing event loop or create new one
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If loop is running, we need to use run_in_executor
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        lambda: asyncio.run(generate_audio_with_edge_tts_async(clean_text, voice, output_path))
                    )
                    return future.result()
            else:
                return loop.run_until_complete(generate_audio_with_edge_tts_async(clean_text, voice, output_path))
        except RuntimeError:
            # No event loop, create new one
            return asyncio.run(generate_audio_with_edge_tts_async(clean_text, voice, output_path))
            
    except ImportError:
        raise Exception("edge-tts package not installed. Run: pip install edge-tts")
    except Exception as e:
        raise Exception(f"Error generating audio with Edge TTS: {str(e)}")

def generate_audio_with_pyttsx3(text: str, voice_type: str = "male", rate: int = 200, output_path: str = None) -> str:
    """Generate audio using pyttsx3 (offline, free)."""
    try:
        import pyttsx3
        
        if output_path is None:
            output_path = os.path.join(tempfile.gettempdir(), f"audio_{uuid.uuid4()}.wav")
        
        engine = pyttsx3.init()
        
        # Set speech rate
        engine.setProperty('rate', rate)
        
        # Set voice based on preference
        voices = engine.getProperty('voices')
        if voices:
            if voice_type.lower() == "female" and len(voices) > 1:
                engine.setProperty('voice', voices[1].id)
            else:
                engine.setProperty('voice', voices[0].id)
        
        # Set volume
        engine.setProperty('volume', 0.9)
        
        # Save to file
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        
        return output_path
    except ImportError:
        raise Exception("pyttsx3 package not installed. Run: pip install pyttsx3")
    except Exception as e:
        raise Exception(f"Error generating audio with pyttsx3: {str(e)}")

def combine_video_audio(video_path: str, audio_path: str, output_path: str = None) -> str:
    """Combine video and audio using FFmpeg directly."""
    try:
        if output_path is None:
            output_path = os.path.join(tempfile.gettempdir(), f"final_video_{uuid.uuid4()}.mp4")
        
        # Use FFmpeg directly for better compatibility and performance
        ffmpeg_cmd = [
            'ffmpeg',
            '-i', video_path,           # Input video
            '-i', audio_path,           # Input audio
            '-c:v', 'copy',             # Copy video codec (faster)
            '-c:a', 'aac',              # Use AAC audio codec
            '-shortest',                # Use shortest duration (video or audio)
            '-y',                       # Overwrite output file
            output_path
        ]
        
        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg failed: {result.stderr}")
        
        if not os.path.exists(output_path):
            raise Exception("Output video file was not created")
        
        return output_path
        
    except FileNotFoundError:
        # Fallback to MoviePy if FFmpeg is not available
        return combine_video_audio_moviepy(video_path, audio_path, output_path)
    except Exception as e:
        # Try MoviePy fallback
        try:
            return combine_video_audio_moviepy(video_path, audio_path, output_path)
        except:
            raise Exception(f"Error combining video and audio: {str(e)}")

def combine_video_audio_moviepy(video_path: str, audio_path: str, output_path: str = None) -> str:
    """Fallback method using MoviePy with correct API."""
    try:
        from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip
        
        if output_path is None:
            output_path = os.path.join(tempfile.gettempdir(), f"final_video_{uuid.uuid4()}.mp4")
        
        # Load video and audio
        video_clip = VideoFileClip(video_path)
        audio_clip = AudioFileClip(audio_path)
        
        # Adjust audio duration to match video
        if audio_clip.duration > video_clip.duration:
            # Trim audio if it's longer than video
            audio_clip = audio_clip.subclip(0, video_clip.duration)
        elif audio_clip.duration < video_clip.duration:
            # Loop audio if it's shorter than video
            loops_needed = int(video_clip.duration / audio_clip.duration) + 1
            # Create looped audio
            audio_clips = [audio_clip] * loops_needed
            looped_audio = CompositeAudioClip(audio_clips)
            audio_clip = looped_audio.subclip(0, video_clip.duration)
        
        # Combine video with audio - CORRECT METHOD
        final_video = video_clip.set_audio(audio_clip)
        
        # Write the final video
        final_video.write_videofile(
            output_path,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile=os.path.join(tempfile.gettempdir(), f'temp-audio-{uuid.uuid4()}.m4a'),
            remove_temp=True,
            verbose=False,
            logger=None
        )
        
        # Clean up
        video_clip.close()
        audio_clip.close()
        final_video.close()
        
        return output_path
        
    except ImportError:
        raise Exception("moviepy package not installed. Run: pip install moviepy")
    except Exception as e:
        raise Exception(f"MoviePy error: {str(e)}")

def get_voice_mapping(voice_type: str, speech_speed: float = 1.0):
    """Get appropriate voice settings for different TTS services."""
    edge_voices = {
        "male": "en-US-DavisNeural",
        "female": "en-US-AriaNeural", 
        "child": "en-US-AnaNeural"
    }
    
    pyttsx3_rate = max(150, min(300, int(200 * speech_speed)))
    
    return {
        "edge_voice": edge_voices.get(voice_type.lower(), "en-US-AriaNeural"),
        "pyttsx3_rate": pyttsx3_rate
    }

@app.post("/explain-concept")
async def explain_concept(request: ConceptRequest):
    max_attempts = 4
    attempt = 0
    last_error = None
    gemini_file_name = None
    
    while attempt < max_attempts:
        attempt += 1
        try:
            # Generate a unique ID for this request
            request_id = str(uuid.uuid4())
            
            # Enhanced prompt with stricter requirements and better guidance
            prompt = f"""
                Generate Manim code to create a detailed, educational animation explaining this concept: {request.description}
                Use your creativity and artistic flair to make the animation visually appealing and engaging. At the same time
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

            # Extract the generated content
            python_code = json_response["python_code"]
            explanation = json_response["explanation"]
            
            # Create files in a directory outside the project structure
            temp_base_dir = os.path.join(os.path.expanduser("~"), "manim_temp")
            os.makedirs(temp_base_dir, exist_ok=True)
            script_path = os.path.join(temp_base_dir, f"concept_{request_id}.py")
            
            with open(script_path, "w") as f:
                f.write(python_code)
            
            # Create media directory
            media_dir = os.path.join(temp_base_dir, "media")
            os.makedirs(media_dir, exist_ok=True)
            
            # Run Manim to generate video
            result = subprocess.run(
                ["manim", "-qm", "--media_dir", media_dir, script_path, "ExplainConcept"],
                capture_output=True,
                text=True,
                cwd=temp_base_dir
            )
            
            if result.returncode != 0:
                raise Exception(f"Manim execution failed: {result.stderr}")

            # Find the generated video file
            video_dir = os.path.join(media_dir, "videos", f"concept_{request_id}", "720p30")
            video_files = glob.glob(os.path.join(video_dir, "*.mp4"))
            
            if not video_files:
                raise Exception("No video file was generated")

            video_path = video_files[0]
            
            # Generate audio script based on the rendered video
            try:
                audio_script, gemini_file_name = generate_audio_script_from_video(video_path, request.description)
            except Exception as e:
                print(f"Warning: Could not generate audio script from video: {str(e)}")
                # Fallback to a basic script based on the concept
                audio_script = f"This animation explains the concept of {request.description}. Let's explore this educational topic step by step through visual demonstration."
            
            # Generate audio narration using pyttsx3
            voice_settings = get_voice_mapping(request.voice_type, request.speech_speed)
            audio_path = None
            audio_generation_errors = []
            
            # Use pyttsx3 to generate audio
            try:
                audio_path = generate_audio_with_pyttsx3(
                    audio_script, request.voice_type, voice_settings["pyttsx3_rate"]
                )
                if not audio_path or not os.path.exists(audio_path):
                    raise Exception("Audio file was not created")
            except Exception as e:
                audio_generation_errors.append(f"pyttsx3: {str(e)}")
                print(f"Warning: Could not generate audio with pyttsx3: {str(e)}")
            
            if not audio_path:
                print(f"Warning: Could not generate audio. Errors: {audio_generation_errors}")
                # Continue with video-only if audio generation fails
                final_video_path = video_path
            else:
                # Combine video and audio
                try:
                    final_video_path = combine_video_audio(video_path, audio_path)
                    
                    # Clean up audio file
                    if os.path.exists(audio_path):
                        os.remove(audio_path)
                        
                except Exception as e:
                    print(f"Warning: Could not combine audio with video: {str(e)}")
                    # Fall back to video-only
                    final_video_path = video_path
            
            # Upload final video to Cloudinary
            upload_result = cloudinary.uploader.upload(
                final_video_path,
                resource_type="video",
                folder="concept_explanations"
            )
            
            # Cleanup generated files
            cleanup_files = [script_path, final_video_path]
            if final_video_path != video_path:
                cleanup_files.append(video_path)
                
            for file_path in cleanup_files:
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except:
                    pass
            
            # Clean up Gemini uploaded file
            if gemini_file_name:
                cleanup_gemini_file(gemini_file_name)
            
            # Return the response
            response_data = {
                "video_url": upload_result["secure_url"],
                "explanation": explanation,
                "audio_script": audio_script,
                "attempts": attempt,
                "has_audio": audio_path is not None
            }
            
            if audio_generation_errors:
                response_data["audio_warnings"] = audio_generation_errors
                
            return response_data
                
        except Exception as e:
            last_error = str(e)
            print(f"Attempt {attempt} failed: {last_error}")
            
            # Clean up Gemini file if it was uploaded in this attempt
            if gemini_file_name:
                cleanup_gemini_file(gemini_file_name)
                gemini_file_name = None
            
            # Clean up any files that might have been created in this attempt
            cleanup_paths = []
            if 'script_path' in locals():
                cleanup_paths.append(script_path)
            if 'video_files' in locals():
                cleanup_paths.extend(video_files)
            if 'audio_path' in locals() and audio_path:
                cleanup_paths.append(audio_path)
            if 'final_video_path' in locals() and final_video_path:
                cleanup_paths.append(final_video_path)
                
            for path in cleanup_paths:
                try:
                    if os.path.exists(path):
                        os.remove(path)
                except:
                    pass
            
            # Wait before retrying
            if attempt < max_attempts:
                time.sleep(1)
    
    # If all attempts failed, make sure to clean up any remaining Gemini files
    if gemini_file_name:
        cleanup_gemini_file(gemini_file_name)
    
    raise HTTPException(status_code=500, detail=f"Failed after {max_attempts} attempts. Last error: {last_error}")

# Rest of your existing code for video deletion and game generation...
class VideoRequest(BaseModel):
    video_url: str

@app.delete("/delete-video")
async def delete_video(request: VideoRequest):
    video_url = request.video_url
    try:
        match = re.search(r'upload/v\d+/(.+)\.\w+', video_url)
        if not match:
            raise HTTPException(status_code=400, detail="Invalid Cloudinary URL format")
        
        public_id = match.group(1)
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
        game_id = str(uuid.uuid4())
        p5js_code = generate_game_code(request.concept, request.difficulty, request.gameType, request.instructions)
        
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

        try:
            temp_file_path = os.path.join(tempfile.gettempdir(), f"game_{game_id}.json")
            with open(temp_file_path, 'w', encoding='utf-8') as temp_file:
                json.dump(game_data, temp_file)
            
            if not os.path.exists(temp_file_path) or os.path.getsize(temp_file_path) == 0:
                raise Exception("Failed to create temporary file or file is empty")
            
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
