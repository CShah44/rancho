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
import shutil
import pyttsx3
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('manim_debug.log')
    ]
)
logger = logging.getLogger(__name__)

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

def log_directory_contents(directory, description=""):
    """Log all files and directories in the given path"""
    try:
        if os.path.exists(directory):
            logger.info(f"=== {description} - Directory: {directory} ===")
            for root, dirs, files in os.walk(directory):
                level = root.replace(directory, '').count(os.sep)
                indent = ' ' * 2 * level
                logger.info(f"{indent}{os.path.basename(root)}/")
                subindent = ' ' * 2 * (level + 1)
                for file in files:
                    file_path = os.path.join(root, file)
                    file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
                    logger.info(f"{subindent}{file} ({file_size} bytes)")
        else:
            logger.warning(f"Directory does not exist: {directory}")
    except Exception as e:
        logger.error(f"Error logging directory contents for {directory}: {e}")

def wait_for_file_stability(file_path, max_wait=30, check_interval=1):
    """Wait for a file to be completely written (size stops changing)"""
    logger.info(f"Waiting for file stability: {file_path}")
    
    if not os.path.exists(file_path):
        logger.error(f"File does not exist: {file_path}")
        return False
    
    previous_size = -1
    stable_count = 0
    wait_time = 0
    
    while wait_time < max_wait:
        try:
            current_size = os.path.getsize(file_path)
            logger.info(f"File size check: {current_size} bytes (previous: {previous_size})")
            
            if current_size == previous_size and current_size > 0:
                stable_count += 1
                if stable_count >= 3:  # File size stable for 3 consecutive checks
                    logger.info(f"File is stable at {current_size} bytes")
                    return True
            else:
                stable_count = 0
            
            previous_size = current_size
            time.sleep(check_interval)
            wait_time += check_interval
            
        except Exception as e:
            logger.error(f"Error checking file stability: {e}")
            time.sleep(check_interval)
            wait_time += check_interval
    
    logger.warning(f"File did not stabilize within {max_wait} seconds")
    return False

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/explain-concept")
async def explain_concept(request: ConceptRequest):
    max_attempts = 3
    attempt = 0
    last_error = None
    request_id = str(uuid.uuid4())
    
    logger.info(f"=== Starting concept explanation request ===")
    logger.info(f"Request ID: {request_id}")
    logger.info(f"Description: {request.description}")
    
    while attempt < max_attempts:
        attempt += 1
        logger.info(f"=== Attempt {attempt}/{max_attempts} ===")
        
        try:
            # Enhanced prompt with stricter requirements and better guidance
            prompt = f"""
                Generate Manim code to create a detailed, educational animation explaining the concepts requested.
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
                13. DO NOT use any Unicode characters, emojis, or special symbols in the code
                14. Use only ASCII characters and standard English text
                15. Replace any symbols with descriptive text (e.g., "lock" instead of 🔒)
                
                The animation should be 40-60 seconds in length with smooth transitions.
                
                For the explanation:
                - Provide a concise but detailed explanation (150-250 words)
                - Highlight 3-5 key points illustrated in the visualization
                - Explain the educational value of specific visual elements
                - Use clear, direct language without unnecessary jargon
                
                DO NOT REFERENCE ANY EXTERNAL SVG OR IMAGE FILES.
                DO NOT USE UNICODE CHARACTERS OR EMOJIS IN THE CODE.
                Return only the Python code without any explanations or markdown.
                Also provide a brief explanation of the visualization. Address the animation as visualization in explanation.
            """

            logger.info("Generating code with Gemini...")
            response = client.models.generate_content(
                model="gemini-2.0-flash", contents=request.description, config={
                    'system_instruction': prompt,
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
            logger.info("Code generated successfully")
        
            # Create files in a directory outside the project structure to avoid reload issues
            temp_base_dir = os.path.join(os.path.expanduser("~"), "manim_temp")
            os.makedirs(temp_base_dir, exist_ok=True)
            logger.info(f"Using temp directory: {temp_base_dir}")
            
            script_path = os.path.join(temp_base_dir, f"concept_{request_id}.py")
            logger.info(f"Writing script to: {script_path}")
            
            with open(script_path, "w") as f:
                f.write(python_code)
            
            # Verify script was written
            if os.path.exists(script_path):
                script_size = os.path.getsize(script_path)
                logger.info(f"Script written successfully: {script_size} bytes")
            else:
                raise Exception("Failed to write script file")
            
            # Create media directory in the same external location
            media_dir = os.path.join(temp_base_dir, "media")
            os.makedirs(media_dir, exist_ok=True)
            logger.info(f"Media directory: {media_dir}")
            
            # Log directory state before Manim execution
            log_directory_contents(temp_base_dir, "Before Manim execution")
            
            # Run Manim with the external directory
            logger.info("Starting Manim execution...")
            manim_command = ["manim", "-qm", "--media_dir", media_dir, script_path, "ExplainConcept"]
            logger.info(f"Manim command: {' '.join(manim_command)}")
            
            result = subprocess.run(
                manim_command,
                capture_output=True,
                text=True,
                cwd=temp_base_dir
            )
            
            logger.info(f"Manim execution completed with return code: {result.returncode}")
            logger.info(f"Manim stdout: {result.stdout}")
            if result.stderr:
                logger.warning(f"Manim stderr: {result.stderr}")
            
            if result.returncode != 0:
                raise Exception(f"Manim execution failed: {result.stderr}")

            # Log directory state after Manim execution
            log_directory_contents(media_dir, "After Manim execution")

            # Find the generated video file using a glob pattern to match any video file in the 720p30 directory
            video_dir = os.path.join(media_dir, "videos", f"concept_{request_id}", "720p30")
            logger.info(f"Looking for video files in: {video_dir}")
            
            # Log the video directory contents
            log_directory_contents(video_dir, "Video output directory")
            
            video_files = glob.glob(os.path.join(video_dir, "*.mp4"))
            logger.info(f"Found video files: {video_files}")
            
            if not video_files:
                # Try alternative patterns
                alternative_patterns = [
                    os.path.join(media_dir, "videos", f"concept_{request_id}", "**", "*.mp4"),
                    os.path.join(media_dir, "videos", "**", "*.mp4"),
                    os.path.join(media_dir, "**", "*.mp4")
                ]
                
                for pattern in alternative_patterns:
                    logger.info(f"Trying alternative pattern: {pattern}")
                    video_files = glob.glob(pattern, recursive=True)
                    if video_files:
                        logger.info(f"Found videos with alternative pattern: {video_files}")
                        break
                
                if not video_files:
                    raise Exception("No video file was generated")

            # Use the first video file found
            video_path = video_files[0]
            logger.info(f"Selected video file: {video_path}")
            
            # Check video file properties
            if os.path.exists(video_path):
                video_size = os.path.getsize(video_path)
                logger.info(f"Video file size: {video_size} bytes")
                
                # Wait for file to be stable
                if not wait_for_file_stability(video_path):
                    logger.warning("Video file may not be completely written")
                
            else:
                raise Exception(f"Video file does not exist: {video_path}")
            
            final_video_path = video_path
            
            # Try to add audio to the video
            try:
                logger.info("Attempting to add audio to video...")
                final_video_path = await add_audio_to_video(video_path, request.description, request_id, temp_base_dir)
                logger.info(f"Audio added successfully. Final video: {final_video_path}")
            except Exception as audio_error:
                logger.error(f"Audio generation failed: {audio_error}. Proceeding with original video.")
                final_video_path = video_path
            
            # Final check before upload
            if os.path.exists(final_video_path):
                final_size = os.path.getsize(final_video_path)
                logger.info(f"Final video file size before upload: {final_size} bytes")
                
                # Wait for final file stability
                if not wait_for_file_stability(final_video_path):
                    logger.warning("Final video file may not be completely written")
                
            else:
                raise Exception(f"Final video file does not exist: {final_video_path}")
            
            # Upload to Cloudinary
            logger.info("Starting Cloudinary upload...")
            upload_result = cloudinary.uploader.upload(
                final_video_path,
                resource_type="video",
                folder="concept_explanations"
            )
            logger.info(f"Cloudinary upload successful: {upload_result['secure_url']}")
            
            # Cleanup all generated files
            logger.info("Starting cleanup...")
            cleanup_files(script_path, media_dir, request_id, temp_base_dir)
            logger.info("Cleanup completed")
            
            # Return the URL of the uploaded video
            return {
                "video_url": upload_result["secure_url"],
                "explanation": explanation,
                "attempts": attempt
            }
                
        except Exception as e:
            last_error = str(e)
            logger.error(f"Attempt {attempt} failed: {last_error}")
            
            # Log directory state on error
            try:
                if 'temp_base_dir' in locals():
                    log_directory_contents(temp_base_dir, f"Error state - Attempt {attempt}")
            except:
                pass
            
            # Clean up any files that might have been created in this attempt
            try:
                cleanup_files(
                    locals().get('script_path'),
                    locals().get('media_dir'),
                    request_id,
                    locals().get('temp_base_dir')
                )
            except Exception as cleanup_error:
                logger.error(f"Cleanup error: {cleanup_error}")
            
            # Wait a short time before retrying
            if attempt < max_attempts:
                logger.info(f"Waiting before retry...")
                time.sleep(2)
    
    # If we've exhausted all attempts, raise an exception
    logger.error(f"All attempts failed. Last error: {last_error}")
    raise HTTPException(status_code=500, detail=f"Failed after {max_attempts} attempts. Last error: {last_error}")

async def add_audio_to_video(video_path, concept_description, request_id, temp_base_dir):
    """Add audio narration to the video using Gemini for transcript and pyttsx3 for TTS"""
    
    logger.info(f"=== Starting audio generation ===")
    logger.info(f"Input video: {video_path}")
    
    # First, get video duration for reference
    try:
        ffprobe_result = subprocess.run([
            "ffprobe", "-v", "quiet", "-show_entries", "format=duration", 
            "-of", "csv=p=0", video_path
        ], capture_output=True, text=True)
        
        if ffprobe_result.returncode == 0:
            video_duration = float(ffprobe_result.stdout.strip())
            logger.info(f"Original video duration: {video_duration} seconds")
        else:
            logger.warning("Could not determine video duration")
            video_duration = 30.0  # Default fallback
    except Exception as e:
        logger.error(f"Error getting video duration: {e}")
        video_duration = 30.0
    
    # Upload video to Gemini for transcript generation
    uploaded_file = None
    try:
        # Upload the video file to Gemini
        logger.info("Uploading video to Gemini...")
        uploaded_file = client.files.upload(file=video_path)
        logger.info(f"Uploaded file: {uploaded_file.name}")
        
        # Wait for the file to be in ACTIVE state
        logger.info(f"Uploaded file: {uploaded_file.name}, waiting for ACTIVE state...")
        max_wait_time = 60  # 1 minute maximum wait time
        wait_interval = 2    # Check every 2 seconds
        elapsed_time = 0
        
        while elapsed_time < max_wait_time:
            try:
                # Get the current file status
                file_status = client.files.get(name=uploaded_file.name)
                logger.info(f"File state: {file_status.state}, elapsed time: {elapsed_time}s")
                
                if file_status.state == "ACTIVE":
                    logger.info("File is now ACTIVE, proceeding with transcript generation...")
                    break
                elif file_status.state == "FAILED":
                    raise Exception(f"File processing failed: {uploaded_file.name}")
                
                # Wait before checking again
                time.sleep(wait_interval)
                elapsed_time += wait_interval
                
            except Exception as status_error:
                logger.error(f"Error checking file status: {status_error}")
                time.sleep(wait_interval)
                elapsed_time += wait_interval
        
        if elapsed_time >= max_wait_time:
            raise Exception(f"File did not become ACTIVE within {max_wait_time} seconds")
        
        # Generate transcript using Gemini
        logger.info("Generating transcript with Gemini...")
        transcript_prompt = f"""
        Watch this educational video about "{concept_description}" and generate a natural, engaging narration script.

        Requirements:
        1. The narration should explain what's happening in the video step by step
        2. Use clear, educational language suitable for learning
        4. Include natural pauses where appropriate
        5. Make it engaging and informative
        6. Avoid filler words and unnecessary repetition
        7. The script should be substantial enough for a proper educational narration
        
        Return only the narration text without any formatting or timestamps.
        Make sure the script is long enough to provide meaningful educational content.
        """
        
        transcript_response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[uploaded_file, transcript_prompt]
        )
        
        transcript = transcript_response.text.strip()
        logger.info(f"Generated transcript length: {len(transcript)} characters")
        logger.info(f"Generated transcript preview: {transcript[:200]}...")
        
        # Validate transcript length
        if len(transcript) < 50:
            logger.warning("Transcript too short, generating fallback")
            transcript = f"This educational animation demonstrates the concept of {concept_description}. " \
                        f"Watch carefully as we explore the key principles and applications. " \
                        f"The visualization shows step-by-step how these concepts work in practice. " \
                        f"Pay attention to the transitions and explanations provided throughout the animation."
        
        # Generate audio using pyttsx3
        audio_path = os.path.join(temp_base_dir, f"audio_{request_id}.wav")
        logger.info(f"Generating audio file: {audio_path}")
        
        # Initialize TTS engine with better error handling
        try:
            tts_engine = pyttsx3.init()
            
            # Set properties for better quality
            tts_engine.setProperty('rate', 140)  # Slightly slower for clarity
            tts_engine.setProperty('volume', 0.9)  # Volume level
            
            # Get available voices and set a clear one if possible
            voices = tts_engine.getProperty('voices')
            if voices:
                logger.info(f"Available voices: {len(voices)}")
                # Try to find a good voice
                for voice in voices:
                    logger.info(f"Voice: {voice.name} - {voice.id}")
                    if 'female' in voice.name.lower() or 'woman' in voice.name.lower():
                        tts_engine.setProperty('voice', voice.id)
                        logger.info(f"Selected voice: {voice.name}")
                        break
                else:
                    # If no female voice found, use the first available voice
                    tts_engine.setProperty('voice', voices[0].id)
                    logger.info(f"Selected default voice: {voices[0].name}")
            
            # Save audio to file
            logger.info("Generating TTS audio...")
            tts_engine.save_to_file(transcript, audio_path)
            tts_engine.runAndWait()
            
            # Clean up TTS engine
            try:
                tts_engine.stop()
            except:
                pass
                
        except Exception as tts_error:
            logger.error(f"TTS engine error: {tts_error}")
            raise Exception(f"Failed to generate audio: {tts_error}")
        
        # Verify audio file was created and check its properties
        if not os.path.exists(audio_path):
            raise Exception("Audio file was not created")
        
        audio_size = os.path.getsize(audio_path)
        logger.info(f"Audio file generated: {audio_path} ({audio_size} bytes)")
        
        if audio_size == 0:
            raise Exception("Audio file is empty")
        
        # Check audio duration
        try:
            ffprobe_audio_result = subprocess.run([
                "ffprobe", "-v", "quiet", "-show_entries", "format=duration", 
                "-of", "csv=p=0", audio_path
            ], capture_output=True, text=True)
            
            if ffprobe_audio_result.returncode == 0:
                audio_duration = float(ffprobe_audio_result.stdout.strip())
                logger.info(f"Generated audio duration: {audio_duration} seconds")
                
                if audio_duration < 1.0:
                    raise Exception(f"Audio duration too short: {audio_duration} seconds")
            else:
                logger.warning("Could not determine audio duration")
                
        except Exception as duration_error:
            logger.error(f"Error checking audio duration: {duration_error}")
        
        # Wait for audio file stability
        if not wait_for_file_stability(audio_path, max_wait=10):
            logger.warning("Audio file may not be completely written")
        
        # Combine video and audio using ffmpeg with better options
        output_video_path = os.path.join(temp_base_dir, f"final_video_{request_id}.mp4")
        logger.info(f"Combining video and audio to: {output_video_path}")
        
        # Use different FFmpeg strategy - don't use shortest, pad audio if needed
        ffmpeg_command = [
            "ffmpeg", "-i", video_path, "-i", audio_path,
            "-c:v", "copy",  # Copy video stream as-is
            "-c:a", "aac",   # Encode audio as AAC
            "-b:a", "128k",  # Set audio bitrate
            "-filter_complex", f"[1:a]apad=pad_dur={video_duration}[padded_audio]",  # Pad audio to video length
            "-map", "0:v:0", "-map", "[padded_audio]",  # Map video and padded audio
            "-shortest",     # Still use shortest but now audio is padded
            "-y", output_video_path
        ]
        logger.info(f"FFmpeg command: {' '.join(ffmpeg_command)}")
        
        ffmpeg_result = subprocess.run(ffmpeg_command, capture_output=True, text=True)
        
        logger.info(f"FFmpeg return code: {ffmpeg_result.returncode}")
        logger.info(f"FFmpeg stdout: {ffmpeg_result.stdout}")
        if ffmpeg_result.stderr:
            logger.info(f"FFmpeg stderr: {ffmpeg_result.stderr}")
        
        if ffmpeg_result.returncode != 0:
            # Try fallback method without audio padding
            logger.warning("FFmpeg with padding failed, trying fallback method...")
            ffmpeg_fallback_command = [
                "ffmpeg", "-i", video_path, "-i", audio_path,
                "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
                "-map", "0:v:0", "-map", "1:a:0",
                "-t", str(video_duration),  # Limit to video duration
                "-y", output_video_path
            ]
            
            ffmpeg_result = subprocess.run(ffmpeg_fallback_command, capture_output=True, text=True)
            logger.info(f"Fallback FFmpeg return code: {ffmpeg_result.returncode}")
            
            if ffmpeg_result.returncode != 0:
                raise Exception(f"FFmpeg failed: {ffmpeg_result.stderr}")
        
        # Verify final video was created
        if not os.path.exists(output_video_path):
            raise Exception("Final video file was not created")
        
        final_video_size = os.path.getsize(output_video_path)
        logger.info(f"Final video created: {output_video_path} ({final_video_size} bytes)")
        
        if final_video_size == 0:
            raise Exception("Final video file is empty")
        
        # Check final video duration
        try:
            ffprobe_final_result = subprocess.run([
                "ffprobe", "-v", "quiet", "-show_entries", "format=duration", 
                "-of", "csv=p=0", output_video_path
            ], capture_output=True, text=True)
            
            if ffprobe_final_result.returncode == 0:
                final_duration = float(ffprobe_final_result.stdout.strip())
                logger.info(f"Final video duration: {final_duration} seconds")
                
                if final_duration < video_duration * 0.5:
                    logger.warning(f"Final video duration seems too short: {final_duration}s vs original {video_duration}s")
            
        except Exception as final_duration_error:
            logger.error(f"Error checking final video duration: {final_duration_error}")
        
        # Wait for final video stability
        if not wait_for_file_stability(output_video_path, max_wait=15):
            logger.warning("Final video file may not be completely written")
        
        # Clean up temporary audio file
        try:
            if os.path.exists(audio_path):
                os.remove(audio_path)
                logger.info("Temporary audio file cleaned up")
        except Exception as cleanup_error:
            logger.warning(f"Failed to cleanup audio file: {cleanup_error}")
        
        logger.info("Audio generation completed successfully")
        return output_video_path
        
    except Exception as e:
        logger.error(f"Error in add_audio_to_video: {e}")
        raise e
    finally:
        # Clean up uploaded file from Gemini
        if uploaded_file:
            try:
                logger.info(f"Cleaning up uploaded file: {uploaded_file.name}")
                client.files.delete(name=uploaded_file.name)
                logger.info("Gemini file cleanup completed")
            except Exception as cleanup_error:
                logger.error(f"Failed to cleanup uploaded file from Gemini: {cleanup_error}")


def cleanup_files(script_path, media_dir, request_id, temp_base_dir=None):
    """Clean up all generated files including the entire concept folder"""
    logger.info("=== Starting cleanup ===")
    
    try:
        # Remove the script file
        if script_path and os.path.exists(script_path):
            os.remove(script_path)
            logger.info(f"Removed script file: {script_path}")
        
        # Remove the entire concept folder from media directory
        if media_dir:
            concept_folder = os.path.join(media_dir, "videos", f"concept_{request_id}")
            if os.path.exists(concept_folder):
                shutil.rmtree(concept_folder)
                logger.info(f"Removed concept folder: {concept_folder}")
        
        # Clean up any final video files in temp directory
        if temp_base_dir:
            final_video_pattern = os.path.join(temp_base_dir, f"final_video_{request_id}.mp4")
            audio_pattern = os.path.join(temp_base_dir, f"audio_{request_id}.wav")
            
            for pattern in [final_video_pattern, audio_pattern]:
                for file_path in glob.glob(pattern):
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        logger.info(f"Removed temp file: {file_path}")
        else:
            # Fallback to default temp directory
            temp_base_dir = os.path.join(os.path.expanduser("~"), "manim_temp")
            final_video_pattern = os.path.join(temp_base_dir, f"final_video_{request_id}.mp4")
            audio_pattern = os.path.join(temp_base_dir, f"audio_{request_id}.wav")
            
            for pattern in [final_video_pattern, audio_pattern]:
                for file_path in glob.glob(pattern):
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        logger.info(f"Removed temp file: {file_path}")
                        
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")

class VideoRequest(BaseModel):
    video_url: str

@app.delete("/delete-video")
async def delete_video(request: VideoRequest):
    video_url = request.video_url
    logger.info(f"Deleting video: {video_url}")
    
    try:
        # Extract the public_id from the Cloudinary URL
        # Cloudinary URLs typically look like: https://res.cloudinary.com/cloud_name/video/upload/v1234567890/folder/public_id.mp4
        match = re.search(r'upload/v\d+/(.+)\.\w+', video_url)
        if not match:
            raise HTTPException(status_code=400, detail="Invalid Cloudinary URL format")
        
        public_id = match.group(1)
        logger.info(f"Extracted public_id: {public_id}")
        
        # The public_id now includes the folder, e.g., "concept_explanations/bruwtqelu1kciogqze6z"
        # No need to add the folder prefix manually
        
        # Delete the video from Cloudinary
        result = cloudinary.uploader.destroy(public_id, resource_type="video")
        logger.info(f"Cloudinary delete result: {result}")
        
        if result.get('result') != 'ok':
            raise HTTPException(status_code=500, detail=f"Failed to delete video: {result.get('result')}")
        
        return {"status": "success", "message": "Video deleted successfully"}
    
    except Exception as e:
        logger.error(f"Error deleting video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting video: {str(e)}")
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

# Add a debug endpoint to check logs
@app.get("/debug/logs")
async def get_logs():
    """Return recent log entries for debugging"""
    try:
        if os.path.exists('manim_debug.log'):
            with open('manim_debug.log', 'r') as f:
                lines = f.readlines()
                # Return last 100 lines
                return {"logs": lines[-100:]}
        else:
            return {"logs": ["No log file found"]}
    except Exception as e:
        return {"error": f"Failed to read logs: {str(e)}"}

@app.get("/debug/temp-dir")
async def check_temp_dir():
    """Check the contents of the temp directory"""
    try:
        temp_base_dir = os.path.join(os.path.expanduser("~"), "manim_temp")
        if os.path.exists(temp_base_dir):
            contents = []
            for root, dirs, files in os.walk(temp_base_dir):
                level = root.replace(temp_base_dir, '').count(os.sep)
                indent = ' ' * 2 * level
                contents.append(f"{indent}{os.path.basename(root)}/")
                subindent = ' ' * 2 * (level + 1)
                for file in files:
                    file_path = os.path.join(root, file)
                    file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
                    contents.append(f"{subindent}{file} ({file_size} bytes)")
            return {"temp_dir": temp_base_dir, "contents": contents}
        else:
            return {"temp_dir": temp_base_dir, "contents": ["Directory does not exist"]}
    except Exception as e:
        return {"error": f"Failed to check temp directory: {str(e)}"}

# Add health check with more details
@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check if required tools are available
        tools_status = {}
        
        # Check manim
        try:
            result = subprocess.run(["manim", "--version"], capture_output=True, text=True, timeout=10)
            tools_status["manim"] = {
                "available": result.returncode == 0,
                "version": result.stdout.strip() if result.returncode == 0 else result.stderr.strip()
            }
        except Exception as e:
            tools_status["manim"] = {"available": False, "error": str(e)}
        
        # Check ffmpeg
        try:
            result = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True, timeout=10)
            tools_status["ffmpeg"] = {
                "available": result.returncode == 0,
                "version": result.stdout.split('\n')[0] if result.returncode == 0 else result.stderr.strip()
            }
        except Exception as e:
            tools_status["ffmpeg"] = {"available": False, "error": str(e)}
        
        # Check temp directory
        temp_base_dir = os.path.join(os.path.expanduser("~"), "manim_temp")
        temp_dir_status = {
            "path": temp_base_dir,
            "exists": os.path.exists(temp_base_dir),
            "writable": os.access(temp_base_dir, os.W_OK) if os.path.exists(temp_base_dir) else False
        }
        
        # Check environment variables
        env_vars = {
            "GEMINI_API_KEY": "set" if os.environ.get("GEMINI_API_KEY") else "missing",
            "CLOUDINARY_CLOUD_NAME": "set" if os.environ.get("CLOUDINARY_CLOUD_NAME") else "missing",
            "CLOUDINARY_API_KEY": "set" if os.environ.get("CLOUDINARY_API_KEY") else "missing",
            "CLOUDINARY_API_SECRET": "set" if os.environ.get("CLOUDINARY_API_SECRET") else "missing"
        }
        
        return {
            "status": "healthy",
            "tools": tools_status,
            "temp_directory": temp_dir_status,
            "environment_variables": env_vars,
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }
