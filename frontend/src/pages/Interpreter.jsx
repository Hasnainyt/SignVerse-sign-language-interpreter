import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import {
  ELEVENLABS_VOICES,
  speakText,
  stopSpeech,
} from "../services/elevenLabsService";

const LANGUAGES = [
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "ur", label: "Urdu" },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const RECOGNITION_POLL_MS = 2500;

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],         // index
  [5, 9], [9, 10], [10, 11], [11, 12],    // middle
  [9, 13], [13, 14], [14, 15], [15, 16],  // ring
  [13, 17], [17, 18], [18, 19], [19, 20], // pinky
  [0, 17],                                // palm base
];

export default function Interpreter() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const rafIdRef = useRef(null);

  // Tracks real-time presence of hand in live camera frame
  const hasHandsRef = useRef(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [recognizedText, setRecognizedText] = useState("");
  const [language, setLanguage] = useState("hi");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");

  // ElevenLabs TTS State
  const [selectedVoice, setSelectedVoice] = useState("EXAVITQu4vr4xnSDxMaL"); // Sarah
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechProvider, setSpeechProvider] = useState(null);
  const lastSpokenTextRef = useRef("");

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
    } catch {
      setCameraError("Camera access was denied or is unavailable.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    hasHandsRef.current = false;
    setCameraOn(false);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7);
  };

  useEffect(() => () => stopCamera(), []);

  // Initialize MediaPipe HandLandmarker safely
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });
        if (!cancelled) handLandmarkerRef.current = landmarker;
      } catch (err) {
        console.warn("HandLandmarker initialized with fallback mode:", err);
      }
    })();

    return () => {
      cancelled = true;
      handLandmarkerRef.current?.close();
    };
  }, []);

  // Live Canvas Hand Skeleton Drawing Loop & Hand Presence Detector
  useEffect(() => {
    if (!cameraOn) {
      hasHandsRef.current = false;
      const ctx = canvasRef.current?.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
      return;
    }

    const drawFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = handLandmarkerRef.current;

      if (video && canvas && landmarker && video.videoWidth > 0 && video.videoHeight > 0) {
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }

        try {
          const result = landmarker.detectForVideo(video, performance.now());
          const hands = result.landmarks ?? [];
          hasHandsRef.current = hands.length > 0;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const scale = Math.max(
              canvas.width / video.videoWidth,
              canvas.height / video.videoHeight
            );
            const offsetX = (canvas.width - video.videoWidth * scale) / 2;
            const offsetY = (canvas.height - video.videoHeight * scale) / 2;
            const toCanvasX = (x) => x * video.videoWidth * scale + offsetX;
            const toCanvasY = (y) => y * video.videoHeight * scale + offsetY;

            for (const hand of hands) {
              ctx.strokeStyle = "#43A047";
              ctx.lineWidth = 2;
              for (const [a, b] of HAND_CONNECTIONS) {
                ctx.beginPath();
                ctx.moveTo(toCanvasX(hand[a].x), toCanvasY(hand[a].y));
                ctx.lineTo(toCanvasX(hand[b].x), toCanvasY(hand[b].y));
                ctx.stroke();
              }
              ctx.fillStyle = "#1E88E5";
              for (const point of hand) {
                ctx.beginPath();
                ctx.arc(toCanvasX(point.x), toCanvasY(point.y), 3, 0, 2 * Math.PI);
                ctx.fill();
              }
            }
          }
        } catch {
          // Ignore transient frames safely
        }
      }

      rafIdRef.current = requestAnimationFrame(drawFrame);
    };

    rafIdRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [cameraOn]);

  // Frame Capture and Recognition Polling Loop — ONLY POLLS WHEN HANDS ARE PRESENT
  useEffect(() => {
    if (!cameraOn) return;

    const interval = setInterval(async () => {
      // STOP recognition requests if no hands are visible in camera feed!
      if (!hasHandsRef.current) return;

      const frame = captureFrame();
      if (!frame) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/recognize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frame, hasHand: hasHandsRef.current }),
        });
        if (!res.ok) return;
        const data = await res.json();
        
        // Only append text if valid gesture text was returned
        if (data?.success && data.data?.text) {
          const newText = data.data.text;
          setRecognizedText((prev) => {
            if (!prev) return newText;
            const words = prev.trim().split(" ");
            if (words[words.length - 1] === newText) return prev;
            return `${prev} ${newText}`;
          });
        }
      } catch {
        // Silently skip unreachable frame captures
      }
    }, RECOGNITION_POLL_MS);

    return () => clearInterval(interval);
  }, [cameraOn]);

  // Live Translation Effect
  useEffect(() => {
    if (!recognizedText.trim()) {
      setTranslatedText("");
      setTranslateError("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsTranslating(true);
      setTranslateError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: recognizedText, targetLang: language }),
        });
        const data = await res.json();
        if (data?.success) {
          setTranslatedText(data.translatedText);
        } else {
          setTranslateError(data?.message || "Translation unavailable.");
        }
      } catch {
        setTranslateError("Couldn't reach translation service.");
      } finally {
        setIsTranslating(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [recognizedText, language]);

  // ElevenLabs Auto-Speak Effect
  useEffect(() => {
    if (!autoSpeak || !recognizedText.trim()) return;

    const fullText = recognizedText.trim();
    const lastSpoken = lastSpokenTextRef.current.trim();

    let textToSpeak = "";
    if (fullText.startsWith(lastSpoken) && fullText.length > lastSpoken.length) {
      textToSpeak = fullText.slice(lastSpoken.length).trim();
    } else if (fullText !== lastSpoken) {
      textToSpeak = fullText;
    }

    if (!textToSpeak) return;

    const timer = setTimeout(async () => {
      setIsSpeaking(true);
      lastSpokenTextRef.current = fullText;
      const res = await speakText(textToSpeak, selectedVoice, API_BASE_URL);
      setSpeechProvider(res.provider);
      setIsSpeaking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [recognizedText, autoSpeak, selectedVoice]);

  const handleManualSpeak = async () => {
    if (!recognizedText.trim()) return;
    setIsSpeaking(true);
    lastSpokenTextRef.current = recognizedText.trim();
    const res = await speakText(recognizedText.trim(), selectedVoice, API_BASE_URL);
    setSpeechProvider(res.provider);
    setIsSpeaking(false);
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  return (
    <div>
      <div className="px-6 md:px-14 pt-2">
        <h1 className="text-3xl font-bold text-[#111111] mb-1">
          Interpreter workspace
        </h1>
        <p className="text-[#777] text-[14.5px]">
          Start your camera and see Indian Sign Language translated to text & voice in real time.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 px-6 md:px-14 py-7 items-start">
        {/* Camera Panel */}
        <div className="flex-1 min-w-[340px] bg-white rounded-[28px] border border-[#f0eee8] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-7">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[17px] text-[#111111]">
              Live camera
            </h3>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#999]">
              <span
                className={`w-[9px] h-[9px] rounded-full ${
                  cameraOn ? "bg-[#43A047]" : "bg-[#E53935]"
                }`}
              />
              {cameraOn ? "Connected" : "Not connected"}
            </div>
          </div>

          <div className="aspect-[4/3] rounded-[20px] bg-[#111111] flex items-center justify-center flex-col gap-3 text-[#8a8a8a] mb-5 overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                cameraOn ? "block" : "hidden"
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full ${
                cameraOn ? "block" : "hidden"
              }`}
            />
            {!cameraOn && (
              <>
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                  📷
                </div>
                <p className="text-[13.5px] text-[#aaa] px-6 text-center">
                  {cameraError || "Your camera preview will appear here"}
                </p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={startCamera}
              disabled={cameraOn}
              className="flex-1 py-3 rounded-full text-[14.5px] font-bold bg-[#1E88E5] text-white disabled:opacity-50 hover:bg-[#1565C0] transition-colors shadow-sm cursor-pointer"
            >
              Start camera
            </button>
            <button
              onClick={stopCamera}
              disabled={!cameraOn}
              className="flex-1 py-3 rounded-full text-[14.5px] font-bold bg-[#fdecea] text-[#c62828] border border-[#f6cfcd] disabled:opacity-50 hover:bg-[#fbb6b4]/20 transition-colors cursor-pointer"
            >
              Stop camera
            </button>
          </div>
          <p className="text-[12.5px] text-[#999] mt-4 leading-relaxed">
            Real-time sign recognition active — captured signs automatically translate to text and speak aloud in English via ElevenLabs AI Voice when hands are detected.
          </p>
        </div>

        {/* Recognized Text & Translation Panel */}
        <div className="flex-1 min-w-[340px] flex flex-col gap-5">
          <div className="bg-white rounded-[28px] border border-[#f0eee8] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-7">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="font-bold text-[17px] text-[#111111]">
                Recognized text
              </h3>

              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[#1E88E5] animate-ping" />
                    🔊 Speaking via ElevenLabs...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#f5f5f7] text-[#666] border border-[#e5e5ea]">
                    ✨ ElevenLabs AI Voice
                  </span>
                )}
              </div>
            </div>

            <textarea
              value={recognizedText}
              onChange={(e) => setRecognizedText(e.target.value)}
              placeholder="Recognized sign language text will appear here and speak out in English voice."
              className="w-full min-h-[140px] bg-[#fbf9f5] border border-[#f0eee8] rounded-[20px] p-5 text-[15px] leading-relaxed text-[#333] resize-none outline-none focus:border-[#1E88E5] transition-all"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={handleManualSpeak}
                  disabled={!recognizedText.trim() || isSpeaking}
                  className="px-4 py-2 rounded-full text-[13.5px] font-bold bg-[#1E88E5] text-white hover:bg-[#1565C0] disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  🔊 Speak Voice
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStopSpeech}
                    className="px-4 py-2 rounded-full text-[13.5px] font-bold bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] hover:bg-[#ffcdd2] transition-colors cursor-pointer"
                  >
                    ⏹️ Stop
                  </button>
                )}

                <button
                  onClick={() => navigator.clipboard.writeText(recognizedText)}
                  className="px-4 py-2 rounded-full text-[13.5px] font-bold bg-white border border-[#eee] text-[#444] hover:bg-[#f7f7f7] transition-colors cursor-pointer"
                >
                  Copy
                </button>

                <button
                  onClick={() => {
                    setRecognizedText("");
                    handleStopSpeech();
                  }}
                  className="px-4 py-2 rounded-full text-[13.5px] font-bold bg-white border border-[#eee] text-[#444] hover:bg-[#f7f7f7] transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  autoSpeak
                    ? "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]"
                    : "bg-[#f5f5f7] text-[#777] border-[#ddd]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoSpeak ? "bg-[#43A047]" : "bg-[#999]"}`} />
                {autoSpeak ? "Auto Voice: ON" : "Auto Voice: OFF"}
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0eee8] flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#666]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#444]">Voice:</span>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-[#fbf9f5] border border-[#e0ded8] rounded-xl px-3 py-1.5 text-[13px] text-[#333] outline-none focus:border-[#1E88E5]"
                >
                  {ELEVENLABS_VOICES.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[12px] text-[#888]">
                {speechProvider === "elevenlabs" ? (
                  <span className="text-[#43A047] font-semibold">✓ ElevenLabs HD Voice Active</span>
                ) : speechProvider === "web-speech" ? (
                  <span className="text-[#F57C00]">Web Speech Active</span>
                ) : (
                  <span>Powered by ElevenLabs API</span>
                )}
              </div>
            </div>
          </div>

          {/* Translator Card */}
          <div className="bg-white rounded-[28px] border border-[#f0eee8] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-7">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[17px] text-[#111111]">Translator</h3>
              {isTranslating && (
                <span className="text-[12px] font-semibold text-[#1E88E5]">
                  Translating…
                </span>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-1 py-2.5 rounded-full text-[13.5px] font-bold border transition-colors cursor-pointer ${
                    language === lang.code
                      ? "bg-[#43A047] text-white border-[#43A047]"
                      : "bg-white text-[#444] border-[#eee] hover:border-[#43A047]"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="bg-[#fbf9f5] border border-[#f0eee8] rounded-[20px] p-5 min-h-[100px] text-[15px] leading-relaxed text-[#333]">
              {translateError ? (
                <span className="text-[#c62828] text-[13.5px]">{translateError}</span>
              ) : translatedText ? (
                translatedText
              ) : (
                <span className="text-[#aaa] text-[13.5px]">
                  The {LANGUAGES.find((l) => l.code === language)?.label}{" "}
                  translation of the recognized text will appear here.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}