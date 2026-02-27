"use client";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/auth";
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Upload,
  Download,
  Send,
  Clock,
  BookOpen,
  MessageSquare,
  List,
  ChevronRight,
  RotateCcw,
  ChevronDown,
  Menu,
  Bell,
  Search,
  Bookmark,
  Clock3,
  Award,
  PanelLeftClose,
  PanelRightClose,
  Maximize2,
  Minimize2,
  Camera,
  Link,
  Info,
  Loader2,
} from "lucide-react";
import {
  BackgroundBeams,
  BackgroundGradient,
  TextGenerateEffect,
  SparklesCore,
  HoverBorderGradient,
} from "@/components/ui/acaternity";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import QuizModal from "./quiz-modal";
import { SearchPage } from "@/app/test3/page";
import { model, generationConfig, safetySettings } from "@/lib/ai";
import html2canvas from 'html2canvas';

export default function PlaybackApp() {
  const [activeTab, setActiveTab] = useState("transcript");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoSrc, setVideoSrc] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [layoutMode, setLayoutMode] = useState("balanced");
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerInterval, setTimerIntervalState] = useState(null);

  const [selectedTimestampObject, setSelectedTimestampObject] = useState();
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedTimestampData, setSelectedTimestampData] = useState();
  const [notes, setNotes] = useState([
    "Take notes on key concepts",
    "Remember to review the transcript",
  ]);
  const [newNote, setNewNote] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [videoData, setVideoData] = useState();

  // New state for YouTube functionality
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [videoExplanations, setVideoExplanations] = useState({});
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [isMiniplayer, setIsMiniplayer] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(true);
  const [timestamps, setTimestamps] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const canvasRef = useRef(null);
  const [user, setUser] = useState({ name: "Guest" });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      router.push("/");
    } else {
      // Decode JWT or fetch user details from backend
      const decodedUser = JSON.parse(atob(token.split(".")[1])); // Decoding JWT
      console.log(decodedUser);
      setUser(decodedUser);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
      setTimerIntervalState(interval);
      return () => clearInterval(interval);
    } else if (timerInterval) {
      clearInterval(timerInterval);
      setTimerIntervalState(null);
    }
  }, [timerActive, timerInterval]);

  // Load YouTube IFrame API
  useEffect(() => {
    // Load the YouTube IFrame API script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Define the onYouTubeIframeAPIReady function
    window.onYouTubeIframeAPIReady = () => {
      if (youtubeVideoId) {
        initYouTubePlayer();
      }
    };

    return () => {
      // Clean up
      window.onYouTubeIframeAPIReady = null;
    };
  }, [youtubeVideoId]);

  // Initialize YouTube player when video ID changes
  useEffect(() => {
    if (youtubeVideoId && window.YT && window.YT.Player) {
      initYouTubePlayer();
    }
  }, [youtubeVideoId]);

  const initYouTubePlayer = () => {
    if (youtubePlayerRef.current) {
      // Destroy existing player if any
      youtubePlayerRef.current = null;
    }

    youtubePlayerRef.current = new window.YT.Player("youtube-player", {
      videoId: youtubeVideoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        fs: 1,
        modestbranding: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = (event) => {
    // Player is ready
    setDuration(event.target.getDuration());
    setShowUrlInput(false);

    // Generate timestamps based on video duration
    generateTimestamps(event.target.getDuration());
  };

  const onPlayerStateChange = (event) => {
    // Update playing state
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);

    // Update current time
    if (youtubePlayerRef.current) {
      const timeUpdateInterval = setInterval(() => {
        if (youtubePlayerRef.current) {
          setCurrentTime(youtubePlayerRef.current.getCurrentTime());
        } else {
          clearInterval(timeUpdateInterval);
        }
      }, 1000);

      return () => clearInterval(timeUpdateInterval);
    }
  };

  const generateTimestamps = (duration) => {
    // Generate timestamps every 30 seconds or at key points
    const timestamps = [];
    const interval = 30; // seconds

    for (let time = 0; time < duration; time += interval) {
      timestamps.push({
        time,
        title: `Timestamp at ${formatTime(time)}`,
      });
    }

    // Update topics with these timestamps
    setTopics(timestamps);

    // Generate mock explanations for each timestamp
    const explanations = {};
    timestamps.forEach((timestamp) => {
      explanations[timestamp.time] = `At ${formatTime(
        timestamp.time
      )}, the video discusses important concepts related to this section. This is a key moment in the presentation that highlights core principles.`;
    });

    setVideoExplanations(explanations);
  };

  const formatTimerTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  console.log(videoData);

  const [transcript, setTranscript] = useState(`
# Introduction to Machine Learning

## Basic Concepts

Machine learning is a subset of artificial intelligence that focuses on developing systems that learn from data. 
Unlike traditional programming, where explicit instructions are provided, machine learning algorithms build models based on sample data to make predictions or decisions.

### Key Components:

1. **Data Collection**: Gathering relevant information
2. **Feature Extraction**: Identifying important attributes
3. **Model Training**: Teaching the algorithm patterns
4. **Evaluation**: Testing the model's performance
5. **Deployment**: Implementing the model in real-world scenarios

## Types of Machine Learning

- **Supervised Learning**: Training with labeled data
- **Unsupervised Learning**: Finding patterns in unlabeled data
- **Reinforcement Learning**: Learning through trial and error
  `);

  const [topics, setTopics] = useState([
    { title: "Introduction to Machine Learning", time: 10 },
    { title: "Supervised vs Unsupervised Learning", time: 30 },
    { title: "Feature Extraction Techniques", time: 60 },
    { title: "Model Training Fundamentals", time: 90 },
    { title: "Evaluation Metrics", time: 120 },
    { title: "Real-world Applications", time: 150 },
    { title: "Future Trends in AI", time: 180 },
  ]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setYoutubeVideoId(""); // Clear YouTube video if local file is selected
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setYoutubeVideoId(""); // Clear YouTube video if local file is selected
    }
  };

  const togglePlay = () => {
    if (youtubeVideoId && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (youtubeVideoId && youtubePlayerRef.current) {
      if (isMuted) {
        youtubePlayerRef.current.unMute();
      } else {
        youtubePlayerRef.current.mute();
      }
      setIsMuted(!isMuted);
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);

    if (youtubeVideoId && youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume * 100);
    } else if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value) => {
    const seekTime = value[0];

    if (youtubeVideoId && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(seekTime);
      setCurrentTime(seekTime);
    } else if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleFullscreen = () => {
    if (youtubeVideoId) {
      // For YouTube videos, use the iframe API
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        const iframe = document.getElementById("youtube-player");
        if (iframe) {
          iframe.requestFullscreen();
        }
      }
    } else if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const setPlaybackSpeed = (speed) => {
    if (youtubeVideoId && youtubePlayerRef.current) {
      youtubePlayerRef.current.setPlaybackRate(speed);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setPlaybackRate(speed);
  };

  const jumpToTimestamp = (seconds) => {
    if (youtubeVideoId && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(seconds);
      setCurrentTime(seconds);
      if (!isPlaying) {
        youtubePlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }

    // Set the selected timestamp for explanation
    setSelectedTimestamp(seconds);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "transcript.pdf";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sendMessage = async () => {
    console.log("sending message");
    if (messageInput.trim() === "") return;

    // Add user message
    setChatMessages([
      ...chatMessages,
      { sender: "user", message: messageInput },
    ]);
    setIsLoading(true);

    try {
      // Send the user's message to the API
      const response = await axios.post("http://localhost:5001/query", {
        query: messageInput,
      });

      // Add the AI response to the chat
      setChatMessages([
        ...chatMessages,
        { sender: "user", message: messageInput },
        { sender: "ai", message: response.data.response },
      ]);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      setChatMessages([
        ...chatMessages,
        { sender: "user", message: messageInput },
        {
          sender: "ai",
          message: "Failed to fetch AI response. Please try again.",
        },
      ]);
    } finally {
      setMessageInput("");
      setIsLoading(false);
    }
  };
  const addNote = () => {
    if (newNote.trim() !== "") {
      setNotes([...notes, newNote]);
      setNewNote("");
    }
  };

  const deleteNote = (index) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
  };

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerSeconds(0);
    setTimerActive(false);
  };

  const getLayoutClasses = () => {
    switch (layoutMode) {
      case "video":
        return {
          videoSection: "lg:w-3/4 w-full",
          contentSection: "lg:w-1/4 w-full",
        };
      case "content":
        return {
          videoSection: "lg:w-1/4 w-full",
          contentSection: "lg:w-3/4 w-full",
        };
      default:
        return {
          videoSection: "lg:w-2/5 w-full",
          contentSection: "lg:w-3/5 w-full",
        };
    }
  };

  // Extract YouTube video ID from URL
  const extractYoutubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Handle YouTube URL submission
  const handleYoutubeUrlSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const videoId = extractYoutubeId(youtubeUrl);

    if (videoId) {
      setYoutubeVideoId(videoId);

      const res = await fetch("http://localhost:5001/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtube_url: youtubeUrl,
        }),
      });

      const data = await res.json();

      setVideoData(data);
      setTranscript(data.notes);
      setKeywords(data.keywords.split(",").map((keyword) => keyword.trim()));
      setTimestamps(data.transcript_with_timestamps);
      console.log(timestamps);
      setVideoSrc(""); // Clear local video if YouTube is selected
      setLoading(false);
      toast("YouTube Video Loaded", {
        description: "The video has been loaded successfully.",
      });
    } else {
      toast("Invalid YouTube URL", {
        description: "Please enter a valid YouTube video URL.",
      });
    }

    setLoading(false);
  };

  console.log(keywords, timestamps);
  const encodedKeywords = keywords.map((keyword) =>
    encodeURIComponent(keyword)
  );

  // Replace your current takeScreenshot function with this updated version

  const takeScreenshot = async () => {
    if (youtubeVideoId) {
      // For YouTube videos
      const currentTime = youtubePlayerRef.current?.getCurrentTime() || 0;
      const wasPlaying = youtubePlayerRef.current?.getPlayerState() === 1;
      
      // Pause video temporarily
      if (wasPlaying && youtubePlayerRef.current) {
        youtubePlayerRef.current.pauseVideo();
      }
      
      try {
        console.log("Capturing YouTube screenshot at", formatTime(currentTime));
        
        // Call the backend API to get the screenshot
        const response = await fetch('http://localhost:8000/api/screenshots/youtube', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId: youtubeVideoId,
            timestamp: currentTime
          }),
        });
        
        if (!response.ok) {
          throw new Error('Screenshot API request failed');
        }
        
        // Parse the JSON response
        const responseData = await response.json();
        console.log("Screenshot response:", responseData);
        
        if (responseData.success && responseData.filePath) {
          // Extract just the filename from the full path
          const filename = responseData.filePath.split('\\').pop();
          
          // Add small delay to ensure file is written
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create a data URL using FileReader (read directly from disk)
          try {
            // Instead of trying to load from a URL path, read the file directly
            // since it's on the same machine, we'll use the full path
            const fullPath = responseData.filePath;
            
            // Create a URL that can be displayed immediately in the browser
            // For development purposes, we can use the timestamp to force a reload and bypass cache
            const timestamp = new Date().getTime();
            const screenshotUrl = `http://localhost:8000/screenshots/${filename}?t=${timestamp}`;
            
            // Add to screenshots array with proper URL
            const newScreenshot = {
              time: currentTime,
              dataUrl: screenshotUrl,
              explanation: `Screenshot at ${formatTime(currentTime)}`,
              filePath: responseData.filePath
            };
            
            setScreenshots(prevScreenshots => [...prevScreenshots, newScreenshot]);
            console.log("Screenshot captured successfully");
          } catch (fileError) {
            console.error("Error reading screenshot file:", fileError);
            throw fileError;
          }
        } else {
          throw new Error('Invalid screenshot response');
        }
      } catch (error) {
        console.error("Screenshot API error:", error);
        
        // Use fallback method for screenshot
        fallbackScreenshot(currentTime, wasPlaying);
      } finally {
        // Resume playing if it was playing before
        if (wasPlaying && youtubePlayerRef.current) {
          youtubePlayerRef.current.playVideo();
        }
      }
    } else if (videoRef.current) {
  
    // For local videos - keep existing implementation
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;
    
    // Pause to get clear screenshot
    video.pause();
    
    try {
      if (!canvas) throw new Error("Canvas not available");
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Add timestamp overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      ctx.fillStyle = "white";
      ctx.font = "bold 14px Arial";
      ctx.fillText(`Time: ${formatTime(currentTime)}`, 10, canvas.height - 10);
      
      // Get the screenshot as data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Save the screenshot
      const newScreenshot = {
        time: currentTime,
        dataUrl,
        explanation: `Screenshot at ${formatTime(currentTime)}`
      };
      
      setScreenshots(prevScreenshots => [...prevScreenshots, newScreenshot]);
      
      // Resume playing if needed
      if (wasPlaying) {
        video.play();
      }
    } catch (error) {
      console.error("Local video screenshot error:", error);
      
      // Resume playing if needed
      if (wasPlaying) {
        video.play();
      }
    }
  }
};

  // Toggle miniplayer mode
  const toggleMiniplayer = () => {
    setIsMiniplayer(!isMiniplayer);
  };

  const layoutClasses = getLayoutClasses();

  const fetchDate = async () => {
    console.log("here");

    const parts = [
      {
        text: "You are expert at detecting errors and improving the efficiency of the given code.If there are any errors in the code, keep the first line specifying the error in short and then begin to explain ways to resolve the error. Further irrespective of any error or not give ways to improve the efficiency of code and give the code in an improved format which is precise and most efficient.For the errors, if any focus on the biggest error and then the small ones.Most importantly, return the output in mdx form only",
      },
      { text: "hello world" },
    ];
    let input;
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    setSelectedTimestampData(result);
  };

  const handleSelectedTimestampClick = (timestamp) => {
    console.log("clicked", timestamp);
    setSelectedTimestamp(timestamp);

    const timestampObject = timestamps.find(
      (timestamp) =>
        selectedTimestamp >= timestamp.start &&
        selectedTimestamp <= timestamp.end
    );

    console.log(selectedTimestamp);

    if (timestampObject !== undefined) {
      console.log("Selected timestamp belongs to:", timestampObject);
      setSelectedTimestampObject(timestampObject);
      fetchDate();
      setSelectedLoading(true);

      // Perform any additional actions with the found timestampObject
    } else {
      console.log(
        "Selected timestamp does not belong to any timestamp object."
      );
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="relative">
        <BackgroundBeams className="absolute top-0 left-0 h-full w-full z-0" />

        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-700">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Menu className="h-6 w-6 lg:hidden" />
              <div className="flex items-center gap-2">
                <Play className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  Playback
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="text-sm">
                Discover
              </Button>
              <Button variant="ghost" className="text-sm">
                Library
              </Button>
              <Button variant="ghost" className="text-sm">
                My Courses
              </Button>
              <Button variant="ghost" className="text-sm">
                Community
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-[200px] pl-8 rounded-full bg-background"
                />
              </div>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  3
                </span>
              </Button>

              <div className="flex items-center gap-2">
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="data-[state=checked]:bg-purple-600"
                />
                <Label htmlFor="dark-mode" className="text-sm">
                  {darkMode ? "Dark" : "Light"}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="User"
                  />
                  <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <button className="hidden md:block" onClick={handleLogout}>
                  <div className="text-sm font-medium">{user.name} </div>
                  <div className="text-xs text-muted-foreground">LogOut</div>
                </button>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 relative z-10">
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  <TextGenerateEffect words="Introduction to Machine Learning" />
                </h1>
                <p className="text-muted-foreground mt-2">
                  Learn the fundamentals of machine learning algorithms and
                  applications
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Bookmark className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <QuizModal keywords={keywords} />

                <Button
                  className="bg-purple-600 hover:bg-purple-700 gap-1"
                  onClick={() => {
                    router.push("/test/viva/?keywords=" + encodedKeywords);
                  }}
                >
                  {/* <Link href={`/test/viva?keywords=${encodedKeywords}`}> */}
                  <Award className="h-4 w-4" />
                  Viva
                  {/* </Link> */}
                </Button>
              </div>
            </div>
          </div>

          {/* YouTube URL Input */}
          {showUrlInput && (
            <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Link className="h-5 w-5 text-purple-600" />
                Enter YouTube Video URL
              </h2>
              <form onSubmit={handleYoutubeUrlSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Load Video
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-2">
                Enter a valid YouTube URL to load the video and access timestamp
                features
              </p>
            </div>
          )}

          {/* Layout Controls */}
          <div className="mb-4 flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">Layout:</span>
            <Button
              variant={layoutMode === "balanced" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayoutMode("balanced")}
              className={
                layoutMode === "balanced"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : ""
              }
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant={layoutMode === "video" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayoutMode("video")}
              className={
                layoutMode === "video"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : ""
              }
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
            <Button
              variant={layoutMode === "content" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayoutMode("content")}
              className={
                layoutMode === "content"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : ""
              }
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Section - Video Player */}
            <div
              className={`${layoutClasses.videoSection} transition-all duration-300`}
            >
              <BackgroundGradient className="rounded-xl overflow-hidden">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md overflow-hidden">
                  {!videoSrc && !youtubeVideoId ? (
                    <div
                      className={`h-64 md:h-80 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
                        isDragging
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="relative">
                        <SparklesCore
                          id="tsparticles"
                          background="transparent"
                          minSize={0.6}
                          maxSize={1.4}
                          particleDensity={100}
                          className="w-full h-full absolute"
                          particleColor="#8b5cf6"
                        />
                        <div className="relative z-10 flex flex-col items-center">
                          <Upload className="w-12 h-12 text-purple-500 mb-4" />
                          <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                            Drag and drop your video here
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            or
                          </p>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Browse Files
                          </Button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="video/*"
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`relative ${
                        isMiniplayer
                          ? "fixed bottom-4 right-4 z-50 w-80 shadow-lg rounded-lg overflow-hidden"
                          : ""
                      }`}
                    >
                      {youtubeVideoId ? (
                        <div className="aspect-video bg-black relative" id="youtube-player-container">
                          <div id="youtube-player" className="w-full h-full"></div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-black relative">
                          <video
                            ref={videoRef}
                            src={videoSrc}
                            className="w-full h-full"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                          />
                        </div>
                      )}

                      {/* Video Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="flex flex-col gap-2">
                          {/* Progress Bar */}
                          <Slider
                            value={[currentTime]}
                            min={0}
                            max={duration || 100}
                            step={0.1}
                            onValueChange={handleSeek}
                            className="w-full"
                          />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePlay}
                                className="text-white hover:bg-white/20"
                              >
                                {isPlaying ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </Button>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={toggleMute}
                                  className="text-white hover:bg-white/20"
                                >
                                  {isMuted ? (
                                    <VolumeX className="h-5 w-5" />
                                  ) : (
                                    <Volume2 className="h-5 w-5" />
                                  )}
                                </Button>
                                <Slider
                                  value={[volume]}
                                  min={0}
                                  max={1}
                                  step={0.01}
                                  onValueChange={handleVolumeChange}
                                  className="w-20"
                                />
                              </div>

                              <span className="text-white text-xs">
                                {formatTime(currentTime)} /{" "}
                                {formatTime(duration)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isMiniplayer && (
                                <div className="flex bg-black/30 rounded-md">
                                  {[0.5, 1, 1.5, 2].map((speed) => (
                                    <Button
                                      key={speed}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setPlaybackSpeed(speed)}
                                      className={`text-white text-xs px-2 h-7 hover:bg-white/20 ${
                                        playbackRate === speed
                                          ? "bg-white/20"
                                          : ""
                                      }`}
                                    >
                                      {speed}x
                                    </Button>
                                  ))}
                                </div>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMiniplayer}
                                className="text-white hover:bg-white/20"
                              >
                                {isMiniplayer ? (
                                  <Maximize2 className="h-5 w-5" />
                                ) : (
                                  <Minimize2 className="h-5 w-5" />
                                )}
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={takeScreenshot}
                                className="text-white hover:bg-white/20"
                              >
                                <Camera className="h-5 w-5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleFullscreen}
                                className="text-white hover:bg-white/20"
                              >
                                <Maximize className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </BackgroundGradient>

              {/* Hidden canvas for screenshots */}
              <canvas ref={canvasRef} className="hidden"></canvas>

              {/* Screenshots Gallery */}
              {screenshots.length > 0 && (
                <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Camera className="h-4 w-4 text-purple-500" />
                      Video Screenshots
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {screenshots.map((screenshot, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={screenshot.dataUrl || "/placeholder.svg"}
                          alt={`Screenshot at ${formatTime(screenshot.time)}`}
                          className="w-full h-auto rounded-md object-cover aspect-video"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                          {formatTime(screenshot.time)}
                        </div>
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white"
                            onClick={() => {
                              setSelectedTimestamp(screenshot.time);
                              handleSelectedTimestampClick(screenshot.time);
                              jumpToTimestamp(screenshot.time);
                            }}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Timestamp Explanation */}
              {selectedTimestamp !== null && (
                <div>
                  {selectedLoading ? (
                    <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          Timestamp Analysis: {formatTime(selectedTimestamp)}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTimestamp(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p>
                          {videoExplanations[Math.floor(selectedTimestamp)] ||
                            `At ${formatTime(
                              selectedTimestamp
                            )}, the video discusses important concepts related to this section. This is a key moment in the presentation that highlights core principles.`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                </div>
              )}

              {/* Study Timer */}
              <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-purple-500" />
                    Study Timer
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleTimer}
                      className={
                        timerActive
                          ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                          : ""
                      }
                    >
                      {timerActive ? "Pause" : "Start"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetTimer}>
                      Reset
                    </Button>
                  </div>
                </div>
                <div className="text-3xl font-mono text-center py-2 font-bold text-purple-600 dark:text-purple-400">
                  {formatTimerTime(timerSeconds)}
                </div>
              </div>

              {/* Sticky Notes */}
              <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-amber-500" />
                    Quick Notes
                  </h3>
                </div>
                <div className="space-y-2 mb-4">
                  {notes.map((note, index) => (
                    <div
                      key={index}
                      className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md relative group"
                    >
                      <p className="text-sm">{note}</p>
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteNote(index)}
                      >
                        <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addNote();
                      }
                    }}
                  />
                  <Button onClick={addNote} size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Section - Tabs */}

            {!loading ? (
              <div
                className={`${layoutClasses.contentSection} transition-all duration-300`}
              >
                <div className="bg-white  dark:bg-slate-900 rounded-xl shadow-md overflow-hidden">
                  <Tabs
                    defaultValue="transcript"
                    value={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <div className="border-b m-4 dark:border-gray-700">
                      <TabsList className="w-full  justify-start flex rounded-none bg-transparent border-b dark:border-gray-700">
                        <TabsTrigger
                          value="transcript"
                          className="data-[state=active]:border-b-2 px-8 flex  data-[state=active]:border-purple-500 rounded-none data-[state=active]:shadow-none"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Transcript
                        </TabsTrigger>
                        <TabsTrigger
                          value="qa"
                          className="data-[state=active]:border-b-2  flex px-8 data-[state=active]:border-purple-500 rounded-none data-[state=active]:shadow-none"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Q&A
                        </TabsTrigger>
                        <TabsTrigger
                          value="topics"
                          className="data-[state=active]:border-b-2  flex  mx-16 data-[state=active]:border-purple-500 rounded-none data-[state=active]:shadow-none"
                        >
                          <List className="w-4 h-4 mr-2" />
                          Find Topics
                        </TabsTrigger>
                        <TabsTrigger
                          value="discover"
                          className="data-[state=active]:border-b-2  flex  mx-16 data-[state=active]:border-purple-500 rounded-none data-[state=active]:shadow-none"
                        >
                          <List className="w-4 h-4 mr-2" />
                          Discover
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="h-[500px]">
                      <TabsContent value="transcript" className="m-0 h-full">
                        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                          <h2 className="font-semibold">Lecture Transcript</h2>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadTranscript}
                            className="flex items-center gap-1 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/30"
                          >
                            <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            Download PDF
                          </Button>
                        </div>
                        <ScrollArea className="h-[440px] p-4">
                          <div className="prose dark:prose-invert max-w-none">
                            {transcript.split("\n").map((line, index) => {
                              if (line.startsWith("# ")) {
                                return (
                                  <h1
                                    key={index}
                                    className="text-2xl font-bold text-purple-800 dark:text-purple-300"
                                  >
                                    {line.replace("# ", "")}
                                  </h1>
                                );
                              } else if (line.startsWith("## ")) {
                                return (
                                  <h2
                                    key={index}
                                    className="text-xl font-semibold text-purple-700 dark:text-purple-400"
                                  >
                                    {line.replace("## ", "")}
                                  </h2>
                                );
                              } else if (line.startsWith("### ")) {
                                return (
                                  <h3
                                    key={index}
                                    className="text-lg font-medium text-purple-600 dark:text-purple-500"
                                  >
                                    {line.replace("### ", "")}
                                  </h3>
                                );
                              } else if (line.startsWith("- ")) {
                                return (
                                  <ul
                                    key={index}
                                    className="list-disc list-inside"
                                  >
                                    <li
                                      dangerouslySetInnerHTML={{
                                        __html: line
                                          .replace("- ", "")
                                          .replace(
                                            /\*\*(.*?)\*\*/g,
                                            "<strong>$1</strong>"
                                          ),
                                      }}
                                    />
                                  </ul>
                                );
                              } else if (line.match(/^\d+\. /)) {
                                return (
                                  <ol
                                    key={index}
                                    className="list-decimal list-inside"
                                  >
                                    <li
                                      dangerouslySetInnerHTML={{
                                        __html: line
                                          .replace(/^\d+\. /, "")
                                          .replace(
                                            /\*\*(.*?)\*\*/g,
                                            "<strong>$1</strong>"
                                          ),
                                      }}
                                    />
                                  </ol>
                                );
                              } else if (
                                line.startsWith("**") &&
                                line.endsWith("**")
                              ) {
                                return (
                                  <p key={index} className="font-bold">
                                    {line.replace(/\*\*/g, "")}
                                  </p>
                                );
                              } else if (line.trim() === "") {
                                return <br key={index} />;
                              } else {
                                return (
                                  <p
                                    key={index}
                                    dangerouslySetInnerHTML={{
                                      __html: line.replace(
                                        /\*\*(.*?)\*\*/g,
                                        "<strong>$1</strong>"
                                      ),
                                    }}
                                  />
                                );
                              }
                            })}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent
                        value="qa"
                        className="m-0 h-full flex flex-col"
                      >
                        {/* Header */}
                        <div className="p-4 border-b dark:border-gray-700">
                          <h2 className="font-semibold">
                            Ask Questions About the Lecture
                          </h2>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 h-[440px] p-4">
                          <div className="space-y-4">
                            {chatMessages.map((msg, index) => (
                              <div
                                key={index}
                                className={`flex ${
                                  msg.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                    msg.sender === "user"
                                      ? "bg-purple-600 text-white"
                                      : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                  }`}
                                >
                                  {msg.message}
                                </div>
                              </div>
                            ))}

                            {/* AI is Thinking Indicator */}
                            {isLoading && (
                              <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-slate-800 flex items-center gap-2">
                                  <RotateCcw className="h-4 w-4 animate-spin" />
                                  <span>AI is thinking...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </ScrollArea>

                        {/* Input Box */}
                        <div className="p-4 border-t dark:border-gray-700">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ask a question about the lecture..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  sendMessage();
                                }
                              }}
                              className="border-purple-200 focus-visible:ring-purple-500 dark:border-purple-800"
                            />
                            <Button
                              onClick={sendMessage}
                              disabled={isLoading}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="topics" className="m-0 h-full">
                        {/* Header */}
                        <div className="p-4 border-b dark:border-gray-700">
                          <h2 className="font-semibold">
                            Key Topics & Timestamps
                          </h2>
                        </div>

                        {/* Topics List */}
                        <ScrollArea className="h-[440px]">
                          <div className="divide-y w-full dark:divide-gray-700">
                            {timestamps.map((topic, index) => (
                              <HoverBorderGradient
                                key={index}
                                className="p-4 bg-white dark:bg-slate-900 cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                                onClick={() => jumpToTimestamp(topic.start)}
                                containerClassName="rounded-none"
                                as="div"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center w-full gap-3">
                                    <Clock className="h-5 w-5 text-purple-500" />
                                    <span className="text-black dark:text-gray-100 truncate text-ellipsis w-96">
                                      {topic.text}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="border-purple-200 text-black dark:text-gray-100 dark:border-purple-800"
                                    >
                                      {formatTime(topic.start)}
                                    </Badge>
                                    <ChevronRight className="h-4 w-4 text-purple-500" />
                                  </div>
                                </div>
                              </HoverBorderGradient>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="discover" className="m-0 h-full">
                        <div className="p-4 border-b dark:border-gray-700">
                          <h2 className="font-semibold">
                            Discover based on the lecture
                          </h2>
                        </div>

                        <ScrollArea className="h-[440px] p-4">
                          <SearchPage query={keywords.join(",")} />
                        </ScrollArea>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="overflow-hidden p-8">
                    <BackgroundGradient className="rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              Deep Learning Fundamentals
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Neural networks, backpropagation, and more
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </BackgroundGradient>
                  </Card>

                  <Card className="overflow-hidden p-8">
                    <BackgroundGradient className="rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-md bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              Natural Language Processing
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Text analysis, sentiment, and transformers
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </BackgroundGradient>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex-1 -mt-28 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin" />
              </div>
            )}
          </div>

          {/* Learning Analytics Section */}
          <div className="my-16 ">
            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 w-full">
                <h2 className="text-xl font-bold mb-6 text-center">
                  Learning Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex w-fullflex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      87%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      Average Completion Rate
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      12.5
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      Hours Watched This Month
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      24
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      Courses In Progress
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Fixed Quiz Button */}
        <div className="fixed bottom-6 right-6 z-20">
          <QuizModal />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

function Share(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function X(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
