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
  Video,
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
  const [volume, setVolume] = useState(1);
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

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
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

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

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
      const a = document.createElement("a");
      a.href = video.videoUrl;
      a.download = video.title || "video";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="my-3 sm:my-4 md:my-6 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-2xl border border-zinc-700/50">
      {/* Enhanced Header */}
      <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm border-b border-zinc-700/50">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Video className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white text-sm sm:text-base md:text-lg truncate">
              {video.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Educational Animation
            </p>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative group bg-black",
          isFullscreen
            ? "bg-black"
            : "rounded-b-xl sm:rounded-b-2xl md:rounded-b-3xl overflow-hidden"
        )}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setShowControls(true)}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          src={video.videoUrl}
          className={cn(
            "w-full object-contain bg-black",
            isFullscreen
              ? "h-screen"
              : "h-[200px] sm:h-[250px] md:h-[350px] lg:h-[450px]"
          )}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          playsInline
        />

        {/* Enhanced Video Title Overlay */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <h3 className="font-semibold truncate text-xs sm:text-sm md:text-base">
            {video.title}
          </h3>
        </div>

        {/* Enhanced Video Controls */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 sm:p-3 md:p-4 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Enhanced Progress bar */}
          <div className="flex items-center mb-2 sm:mb-3 md:mb-4 relative h-2">
            <div className="absolute inset-0 bg-white/20 rounded-full h-0.5 sm:h-1 top-[50%] -translate-y-[50%]"></div>
            <div
              className="absolute left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-0.5 sm:h-1 top-[50%] -translate-y-[50%] transition-all duration-150"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Enhanced Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              {/* Play/Pause button */}
              <button
                onClick={togglePlay}
                className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </button>

              {/* Skip backward - hidden on very small screens */}
              <button
                onClick={skipBackward}
                className="hidden xs:block p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                aria-label="Skip backward 10 seconds"
              >
                <SkipBack className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>

              {/* Skip forward - hidden on very small screens */}
              <button
                onClick={skipForward}
                className="hidden xs:block p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>

              {/* Volume controls */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </button>

                {/* Volume slider - hidden on mobile */}
                <div className="hidden md:flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-12 lg:w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                        volume * 100
                      }%, rgba(255,255,255,0.2) ${
                        volume * 100
                      }%, rgba(255,255,255,0.2) 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Time display */}
              <div className="text-xs sm:text-sm text-white font-mono bg-black/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded backdrop-blur-sm">
                <span className="hidden sm:inline">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <span className="sm:hidden">{formatTime(currentTime)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              {/* Download button */}
              <button
                onClick={handleDownload}
                className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                aria-label="Download video"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>

              {/* Fullscreen button */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
              >
                {isFullscreen ? (
                  <Minimize className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <Maximize className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Play button overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="p-3 sm:p-4 md:p-6 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 border border-white/30 transform hover:scale-110"
              aria-label="Play"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white ml-0.5 sm:ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Info section */}
      {!isFullscreen && (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 backdrop-blur-sm border-t border-zinc-700/50">
          <h4 className="font-semibold mb-2 sm:mb-3 text-white text-sm sm:text-base">
            What&apos;s the video about?
          </h4>
          <div className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed prose prose-sm prose-invert max-w-none">
            <MemoizedMarkdown
              id={id + "-video-explanation"}
              content={video.explanation}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTool;
