import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./memoized-markdown";

interface VideoToolResult {
  type: string;
  status: string;
  title: string;
  videoUrl: string;
  explanation: string;
  mimeType: string;
}

const VideoTool = ({ video, id }: { video: VideoToolResult; id: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle duration change
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setShowControls(true);

    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Set a new timeout to hide controls after 3 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Handle fullscreen change
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  // Add event listener for fullscreen change
  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Skip forward/backward
  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const handleDownload = () => {
    if (video.videoUrl) {
      // Create an anchor element
      const a = document.createElement("a");
      a.href = video.videoUrl;
      // Set the download attribute with the video title or a default name
      a.download = video.title || "video";
      // Append to the body, click it, and remove it
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden bg-zinc-900 shadow-lg">
      <div
        ref={containerRef}
        className={cn("relative group", isFullscreen ? "bg-black" : "")}
        onMouseMove={handleMouseMove}
      >
        {/* Video element remains the same */}
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full rounded-lg"
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          playsInline
        />

        {/* Video Title Overlay remains the same */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent text-white transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <h3 className="font-medium truncate">{video.title}</h3>
        </div>

        {/* Video Controls */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Progress bar remains the same */}
          <div className="flex items-center mb-2 relative h-2">
            <div className="absolute inset-0 bg-zinc-600 rounded-full h-1 top-[50%] -translate-y-[50%]"></div>
            <div
              className="absolute left-0 bg-blue-500 rounded-full h-1 top-[50%] -translate-y-[50%]"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause button remains the same */}
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={18} className="text-white" />
                ) : (
                  <Play size={18} className="text-white" />
                )}
              </button>

              {/* Skip backward remains the same */}
              <button
                onClick={skipBackward}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Skip backward 10 seconds"
              >
                <SkipBack size={18} className="text-white" />
              </button>

              {/* Skip forward remains the same */}
              <button
                onClick={skipForward}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward size={18} className="text-white" />
              </button>

              {/* Volume button remains the same */}
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-white" />
                ) : (
                  <Volume2 size={18} className="text-white" />
                )}
              </button>

              {/* Time display remains the same */}
              <div className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Download button - NEW */}
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Download video"
              >
                <Download size={18} className="text-white" />
              </button>

              {/* Fullscreen button remains the same */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
              >
                {isFullscreen ? (
                  <Minimize size={18} className="text-white" />
                ) : (
                  <Maximize size={18} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Play button overlay remains the same */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Play"
            >
              <Play size={32} className="text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-800 text-white border-t border-zinc-700">
        <h4 className="font-medium mb-2">About this video</h4>
        <div className="text-sm text-zinc-300">
          <MemoizedMarkdown
            id={id + "-video-explanation"}
            content={video.explanation}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoTool;
