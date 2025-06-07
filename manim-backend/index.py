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
        # Check if video file exists and is readable
        if not os.path.exists(video_path):
            raise Exception(f"Video file not found: {video_path}")
        
        if os.path.getsize(video_path) == 0:
            raise Exception("Video file is empty")
        
        print(f"Uploading video file: {video_path} (size: {os.path.getsize(video_path)} bytes)")
        
        # Upload video to Gemini with proper error handling
        uploaded_file = client.files.upload(file=video_path)
        
        print(f"File uploaded successfully: {uploaded_file.name}")
        
        # Wait for the file to be processed and become active
        max_wait_time = 60  # Increased wait time
        wait_interval = 3   # Check every 3 seconds
        elapsed_time = 0
        
        while elapsed_time < max_wait_time:
            try:
                file_info = client.files.get(name=uploaded_file.name)
                print(f"File state: {file_info.state}")
                
                if file_info.state.name == "ACTIVE":
                    print("File is now active and ready for use")
                    break
                elif file_info.state.name == "FAILED":
                    raise Exception(f"File processing failed: {file_info.state}")
                
                print(f"Waiting for file to become active... ({elapsed_time}s elapsed)")
                time.sleep(wait_interval)
                elapsed_time += wait_interval
                
            except Exception as status_error:
                print(f"Error checking file status: {status_error}")
                time.sleep(wait_interval)
                elapsed_time += wait_interval
        
        if elapsed_time >= max_wait_time:
            raise Exception("Timeout waiting for file to become active")
        
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

        print("Generating content with Gemini...")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[uploaded_file, prompt]
        )
        
        if not response or not response.text:
            raise Exception("Empty response from Gemini")
        
        script = response.text.strip()
        file_name = uploaded_file.name
        
        print(f"Successfully generated audio script (length: {len(script)} characters)")
        
        return script, file_name
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error in generate_audio_script_from_video: {error_msg}")
        
        # Clean up the uploaded file if it exists
        if 'uploaded_file' in locals() and uploaded_file:
            try:
                client.files.delete(name=uploaded_file.name)
                print(f"Cleaned up failed upload: {uploaded_file.name}")
            except:
                pass
        
        raise Exception(f"Error generating audio script from video: {error_msg}")

def cleanup_gemini_file(file_name: str):
    """Clean up uploaded file from Gemini with better error handling."""
    if not file_name:
        return
        
    try:
        try:
            file_info = client.files.get(name=file_name)
            print(f"File {file_name} exists, attempting to delete...")
        except Exception:
            print(f"File {file_name} not found, skipping deletion")
            return
        
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
        clean_text = text.encode('ascii', 'ignore').decode('ascii')
        if not clean_text.strip():
            clean_text = text
            
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        lambda: asyncio.run(generate_audio_with_edge_tts_async(clean_text, voice, output_path))
                    )
                    return future.result()
            else:
                return loop.run_until_complete(generate_audio_with_edge_tts_async(clean_text, voice, output_path))
        except RuntimeError:
            return asyncio.run(generate_audio_with_edge_tts_async(clean_text, voice, output_path))
            
    except ImportError:
        raise Exception("edge-tts package not installed. Run: pip install edge-tts")
    except Exception as e:
        raise Exception(f"Error generating audio with Edge TTS: {str(e)}")

def generate_audio_with_pyttsx3(text: str, voice_type: str = "male", rate: int = 200, output_path: str = None) -> str:
    """Generate audio using pyttsx3 (offline, free) with Linux compatibility."""
    try:
        import pyttsx3
        
        if output_path is None:
            output_path = os.path.join(tempfile.gettempdir(), f"audio_{uuid.uuid4()}.wav")
        
        try:
            engine = pyttsx3.init('espeak')
        except:
            try:
                engine = pyttsx3.init()
            except:
                raise Exception("Could not initialize TTS engine")
        
        engine.setProperty('rate', rate)
        
        try:
            voices = engine.getProperty('voices')
            if voices and len(voices) > 0:
                engine.setProperty('voice', voices[0].id)
        except:
            pass
        
        try:
            engine.setProperty('volume', 0.9)
        except:
            pass
        
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise Exception("Audio file was not created or is empty")
        
        return output_path
        
    except ImportError:
        raise Exception("pyttsx3 package not installed")
    except Exception as e:
        raise Exception(f"Error generating audio with pyttsx3: {str(e)}")

def combine_video_audio(video_path: str, audio_path: str, output_path: str = None) -> str:
    """Combine video and audio using FFmpeg directly."""
    try:
        if output_path is None:
            output_path = os.path.join(tempfile.gettempdir(), f"final_video_{uuid.uuid4()}.mp4")
        
        ffmpeg_cmd = [
            'ffmpeg',
            '-i', video_path,
            '-i', audio_path,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest',
            '-y',
            output_path
        ]
        
        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg failed: {result.stderr}")
        
        if not os.path.exists(output_path):
            raise Exception("Output video file was not created")
        
        return output_path
        
    except FileNotFoundError:
        raise Exception("FFmpeg not found. Please install FFmpeg.")
    except subprocess.TimeoutExpired:
        raise Exception("FFmpeg operation timed out")
    except Exception as e:
        raise Exception(f"Error combining video and audio: {str(e)}")

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
    max_attempts = 3
    attempt = 0
    last_error = None
    gemini_file_name = None
    
    while attempt < max_attempts:
        attempt += 1
        try:
            # Generate a unique ID for this request
            request_id = str(uuid.uuid4())
            
            # Enhanced prompt with better timing control
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
                10. IMPORTANT: Add proper timing with self.wait() commands between animations
                11. Each scene should display for at least 2-3 seconds using self.wait(2) or self.wait(3)
                12. End with self.wait(2) to ensure complete rendering
                
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
                model="gemini-2.5-flash-preview-04-17", contents=prompt, config={
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
            python_code = json_response["python_code"]
            explanation = json_response["explanation"]
            
            # Create files in a directory outside the project structure to avoid reload issues
            temp_base_dir = os.path.join(os.path.expanduser("~"), "manim_temp")
            os.makedirs(temp_base_dir, exist_ok=True)
            script_path = os.path.join(temp_base_dir, f"concept_{request_id}.py")
            
            with open(script_path, "w", encoding='utf-8') as f:
                f.write(python_code)
            
            # Create media directory in the same external location
            media_dir = os.path.join(temp_base_dir, "media")
            os.makedirs(media_dir, exist_ok=True)
            
            print(f"Starting Manim rendering for: {script_path}")
            
            # Run Manim with the external directory and timeout
            result = subprocess.run(
                ["manim", "-qm", "--media_dir", media_dir, script_path, "ExplainConcept"],
                capture_output=True,
                text=True,
                cwd=temp_base_dir,
                timeout=600  # 10 minute timeout
            )
            
            if result.returncode != 0:
                print(f"Manim stderr: {result.stderr}")
                print(f"Manim stdout: {result.stdout}")
                raise Exception(f"Manim execution failed: {result.stderr}")

            # Find the generated video file using a glob pattern to match any video file in the 720p30 directory
            video_dir = os.path.join(media_dir, "videos", f"concept_{request_id}", "720p30")
            
            # Wait a bit for file system to sync
            time.sleep(2)
            
            video_files = glob.glob(os.path.join(video_dir, "*.mp4"))
            
            if not video_files:
                raise Exception("No video file was generated")
            
            # Use the first video file found
            video_path = video_files[0]
            
            print(f"Video generated successfully: {video_path}")
            
            # Get video duration using ffprobe for validation
            try:
                duration_cmd = [
                    'ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                    '-of', 'csv=p=0', video_path
                ]
                duration_result = subprocess.run(duration_cmd, capture_output=True, text=True, timeout=30)
                if duration_result.returncode == 0:
                    duration = float(duration_result.stdout.strip())
                    print(f"Video duration: {duration:.2f} seconds")
                    
                    if duration < 5:  # Less than 5 seconds is probably incomplete
                        raise Exception(f"Video duration too short ({duration:.2f}s), likely incomplete")
            except Exception as e:
                print(f"Warning: Could not check video duration: {e}")
            
            # Generate audio script based on the rendered video
            try:
                print(f"Attempting to generate audio script for video: {video_path}")
                audio_script, gemini_file_name = generate_audio_script_from_video(video_path, request.description)
                print("Audio script generated successfully")
            except Exception as e:
                print(f"Warning: Could not generate audio script from video: {str(e)}")
                if gemini_file_name:
                    cleanup_gemini_file(gemini_file_name)
                    gemini_file_name = None
                audio_script = f"This animation explains the concept of {request.description}. Let's explore this educational topic step by step through visual demonstration."
            
            # Generate audio narration
            voice_settings = get_voice_mapping(request.voice_type, request.speech_speed)
            audio_path = None
            audio_generation_errors = []
            
            # Try Edge TTS first (better quality)
            try:
                audio_path = generate_audio_with_edge_tts(
                    audio_script, voice_settings["edge_voice"]
                )
                if not audio_path or not os.path.exists(audio_path):
                    raise Exception("Audio file was not created")
                print("Audio generated successfully with Edge TTS")
            except Exception as e:
                audio_generation_errors.append(f"edge-tts: {str(e)}")
                print(f"Edge TTS failed, trying pyttsx3: {str(e)}")
                
                # Fallback to pyttsx3
                try:
                    audio_path = generate_audio_with_pyttsx3(
                        audio_script, request.voice_type, voice_settings["pyttsx3_rate"]
                    )
                    if not audio_path or not os.path.exists(audio_path):
                        raise Exception("Audio file was not created")
                    print("Audio generated successfully with pyttsx3")
                except Exception as e2:
                    audio_generation_errors.append(f"pyttsx3: {str(e2)}")
                    print(f"Warning: Could not generate audio with pyttsx3: {str(e2)}")
            
            if not audio_path:
                print(f"Warning: Could not generate audio. Errors: {audio_generation_errors}")
                final_video_path = video_path
            else:
                # Combine video and audio
                try:
                    print("Combining video and audio...")
                    final_video_path = combine_video_audio(video_path, audio_path)
                    print(f"Video and audio combined successfully: {final_video_path}")
                    
                    # Clean up audio file
                    if os.path.exists(audio_path):
                        os.remove(audio_path)
                        
                except Exception as e:
                    print(f"Warning: Could not combine audio with video: {str(e)}")
                    final_video_path = video_path
            
            # Upload to Cloudinary
            print("Uploading to Cloudinary...")
            upload_result = cloudinary.uploader.upload(
                final_video_path,
                resource_type="video",
                folder="concept_explanations",
                timeout=300  # 5 minute timeout
            )
            
            print(f"Upload successful: {upload_result['secure_url']}")
            
            # Cleanup the generated files
            cleanup_files = [script_path]
            
            # Add video files to cleanup
            for video_file in video_files:
                cleanup_files.append(video_file)
            
            # Add final video if different from original
            if final_video_path != video_path:
                cleanup_files.append(final_video_path)
            
            for file_path in cleanup_files:
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        print(f"Cleaned up: {file_path}")
                except Exception as e:
                    print(f"Warning: Could not clean up {file_path}: {e}")
            
            # Clean up Gemini uploaded file
            if gemini_file_name:
                cleanup_gemini_file(gemini_file_name)
                gemini_file_name = None
            
            # Return the response
            response_data = {
                "video_url": upload_result["secure_url"],
                "explanation": explanation,
                "audio_script": audio_script,
                "attempts": attempt,
                "has_audio": audio_path is not None,
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
            try:
                if 'script_path' in locals() and os.path.exists(script_path):
                    os.remove(script_path)
                
                if 'video_files' in locals():
                    for video_file in video_files:
                        if os.path.exists(video_file):
                            os.remove(video_file)
                
                if 'audio_path' in locals() and audio_path and os.path.exists(audio_path):
                    os.remove(audio_path)
                
                if 'final_video_path' in locals() and final_video_path and os.path.exists(final_video_path):
                    os.remove(final_video_path)
            except:
                pass
            
            # Wait before retrying
            if attempt < max_attempts:
                wait_time = min(3 * attempt, 10)  # Progressive backoff
                print(f"Waiting {wait_time} seconds before retry...")
                time.sleep(wait_time)
    
    # Final cleanup
    if gemini_file_name:
        cleanup_gemini_file(gemini_file_name)
    
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
