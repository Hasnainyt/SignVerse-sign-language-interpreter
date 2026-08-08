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

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const RECOGNITION_POLL_MS = 2500;

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.2-1.5h4.6L15.5 6h2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
      />
      <circle cx="12" cy="12.5" r="3.2" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10v4h3l4 3V7l-4 3H4Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 7h14M9 7V4h6v3M8 10v7M12 10v7M16 10v7"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 7l.7 13h9.6l.7-13"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export default function Interpreter() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const rafIdRef = useRef(null);

  const hasHandsRef = useRef(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [recognizedText, setRecognizedText] = useState("");
  const [language, setLanguage] = useState("hi");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");

  const [selectedVoice, setSelectedVoice] =
    useState("EXAVITQu4vr4xnSDxMaL");

  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechProvider, setSpeechProvider] = useState(null);

  const lastSpokenTextRef = useRef("");

  const startCamera = async () => {
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      setCameraOn(true);
    } catch {
      setCameraError(
        "Camera access was denied or is unavailable."
      );
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

    if (!video || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.7);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  /* -----------------------------
     MediaPipe initialization
  ----------------------------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 2,
          }
        );

        if (!cancelled) {
          handLandmarkerRef.current = landmarker;
        }
      } catch (err) {
        console.warn(
          "HandLandmarker initialized with fallback mode:",
          err
        );
      }
    })();

    return () => {
      cancelled = true;
      handLandmarkerRef.current?.close();
    };
  }, []);

  /* -----------------------------
     Hand detection / drawing
  ----------------------------- */

  useEffect(() => {
    if (!cameraOn) {
      hasHandsRef.current = false;

      const ctx = canvasRef.current?.getContext("2d");

      ctx?.clearRect(
        0,
        0,
        canvasRef.current?.width || 0,
        canvasRef.current?.height || 0
      );

      return;
    }

    const drawFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = handLandmarkerRef.current;

      if (
        video &&
        canvas &&
        landmarker &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        const rect = canvas.getBoundingClientRect();

        if (
          canvas.width !== rect.width ||
          canvas.height !== rect.height
        ) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }

        try {
          const result = landmarker.detectForVideo(
            video,
            performance.now()
          );

          const hands = result.landmarks ?? [];

          hasHandsRef.current = hands.length > 0;

          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.clearRect(
              0,
              0,
              canvas.width,
              canvas.height
            );

            const scale = Math.max(
              canvas.width / video.videoWidth,
              canvas.height / video.videoHeight
            );

            const offsetX =
              (canvas.width -
                video.videoWidth * scale) /
              2;

            const offsetY =
              (canvas.height -
                video.videoHeight * scale) /
              2;

            const toCanvasX = (x) =>
              x * video.videoWidth * scale + offsetX;

            const toCanvasY = (y) =>
              y * video.videoHeight * scale + offsetY;

            for (const hand of hands) {
              /*
               * Blue hand skeleton to match
               * the SignVerse design system.
               */
              ctx.strokeStyle = "#60a5fa";
              ctx.lineWidth = 2;

              for (const [a, b] of HAND_CONNECTIONS) {
                ctx.beginPath();

                ctx.moveTo(
                  toCanvasX(hand[a].x),
                  toCanvasY(hand[a].y)
                );

                ctx.lineTo(
                  toCanvasX(hand[b].x),
                  toCanvasY(hand[b].y)
                );

                ctx.stroke();
              }

              ctx.fillStyle = "#2563eb";

              for (const point of hand) {
                ctx.beginPath();

                ctx.arc(
                  toCanvasX(point.x),
                  toCanvasY(point.y),
                  3,
                  0,
                  2 * Math.PI
                );

                ctx.fill();
              }
            }
          }
        } catch {
          // Ignore transient frames safely.
        }
      }

      rafIdRef.current =
        requestAnimationFrame(drawFrame);
    };

    rafIdRef.current =
      requestAnimationFrame(drawFrame);

    return () =>
      cancelAnimationFrame(rafIdRef.current);
  }, [cameraOn]);

  /* -----------------------------
     Recognition polling
  ----------------------------- */

  useEffect(() => {
    if (!cameraOn) return;

    const interval = setInterval(async () => {
      if (!hasHandsRef.current) return;

      const frame = captureFrame();

      if (!frame) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/recognize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              frame,
              hasHand: hasHandsRef.current,
            }),
          }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (
          data?.success &&
          data.data?.text
        ) {
          const newText = data.data.text;

          setRecognizedText((prev) => {
            if (!prev) return newText;

            const words = prev.trim().split(" ");

            if (
              words[words.length - 1] === newText
            ) {
              return prev;
            }

            return `${prev} ${newText}`;
          });
        }
      } catch {
        // Silently skip unreachable frame captures.
      }
    }, RECOGNITION_POLL_MS);

    return () => clearInterval(interval);
  }, [cameraOn]);

  /* -----------------------------
     Translation
  ----------------------------- */

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
        const res = await fetch(
          `${API_BASE_URL}/api/translate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: recognizedText,
              targetLang: language,
            }),
          }
        );

        const data = await res.json();

        if (data?.success) {
          setTranslatedText(
            data.translatedText
          );
        } else {
          setTranslateError(
            data?.message ||
              "Translation unavailable."
          );
        }
      } catch {
        setTranslateError(
          "Couldn't reach translation service."
        );
      } finally {
        setIsTranslating(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [recognizedText, language]);

  /* -----------------------------
     ElevenLabs auto speech
  ----------------------------- */

  useEffect(() => {
    if (
      !autoSpeak ||
      !recognizedText.trim()
    ) {
      return;
    }

    const fullText =
      recognizedText.trim();

    const lastSpoken =
      lastSpokenTextRef.current.trim();

    let textToSpeak = "";

    if (
      fullText.startsWith(lastSpoken) &&
      fullText.length > lastSpoken.length
    ) {
      textToSpeak = fullText
        .slice(lastSpoken.length)
        .trim();
    } else if (fullText !== lastSpoken) {
      textToSpeak = fullText;
    }

    if (!textToSpeak) return;

    const timer = setTimeout(async () => {
      setIsSpeaking(true);

      lastSpokenTextRef.current =
        fullText;

      const res = await speakText(
        textToSpeak,
        selectedVoice,
        API_BASE_URL
      );

      setSpeechProvider(
        res.provider
      );

      setIsSpeaking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [
    recognizedText,
    autoSpeak,
    selectedVoice,
  ]);

  /* -----------------------------
     Manual speech
  ----------------------------- */

  const handleManualSpeak = async () => {
    if (!recognizedText.trim()) return;

    setIsSpeaking(true);

    lastSpokenTextRef.current =
      recognizedText.trim();

    const res = await speakText(
      recognizedText.trim(),
      selectedVoice,
      API_BASE_URL
    );

    setSpeechProvider(res.provider);

    setIsSpeaking(false);
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#eff6ff]">

      {/* Page heading */}
      <section className="border-b border-[#dbe7f5] bg-white px-6 py-8 md:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#2563eb]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                Live interpretation
              </div>

              <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#172033] md:text-4xl">
                Interpreter workspace
              </h1>

              <p className="mt-2 max-w-[680px] text-sm leading-6 text-[#64748b] md:text-[15px]">
                Start your camera and see Indian Sign Language
                translated to text and voice in real time.
              </p>
            </div>

            {/* Connection status */}
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
                cameraOn
                  ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]"
                  : "border-[#dbe7f5] bg-white text-[#64748b]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  cameraOn
                    ? "bg-[#2563eb]"
                    : "bg-[#94a3b8]"
                }`}
              />

              {cameraOn
                ? "Camera connected"
                : "Camera not connected"}
            </div>
          </div>
        </div>
      </section>

      {/* Workspace */}
      <section className="px-6 py-7 md:px-10 md:py-9">
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[1.05fr_0.95fr]">

          {/* =============================
              Camera Panel
          ============================== */}

          <div className="rounded-2xl border border-[#d7e5f4] bg-white p-5 shadow-[0_10px_28px_rgba(30,64,175,0.06)] md:p-6">

            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#172033]">
                  Live camera
                </h2>

                <p className="mt-1 text-xs text-[#64748b]">
                  Position your hands clearly inside the frame.
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  cameraOn
                    ? "bg-[#eaf2ff] text-[#1d4ed8]"
                    : "bg-[#f1f5f9] text-[#64748b]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    cameraOn
                      ? "bg-[#2563eb]"
                      : "bg-[#94a3b8]"
                  }`}
                />

                {cameraOn
                  ? "Connected"
                  : "Standby"}
              </div>
            </div>

            {/* Camera preview */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#172033] ring-1 ring-[#dbe7f5]">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${
                  cameraOn
                    ? "block"
                    : "hidden"
                }`}
              />

              <canvas
                ref={canvasRef}
                className={`pointer-events-none absolute inset-0 h-full w-full ${
                  cameraOn
                    ? "block"
                    : "hidden"
                }`}
              />

              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">

                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-blue-200">
                    <CameraIcon />
                  </div>

                  <p className="mt-4 text-sm font-medium text-white">
                    Camera preview
                  </p>

                  <p className="mt-1 max-w-[300px] text-xs leading-5 text-slate-300">
                    {cameraError ||
                      "Start the camera to begin real-time sign recognition."}
                  </p>
                </div>
              )}

              {cameraOn && (
                <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/45 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  Live
                </div>
              )}
            </div>

            {/* Camera controls */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={startCamera}
                disabled={cameraOn}
                className="rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                Start camera
              </button>

              <button
                onClick={stopCamera}
                disabled={!cameraOn}
                className="rounded-xl border border-[#dbe7f5] bg-white px-4 py-3 text-sm font-semibold text-[#526174] transition-colors hover:border-[#c4d7ec] hover:bg-[#f8fbff] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                Stop camera
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-[#dbe7f5] bg-[#f8fbff] px-4 py-3">
              <p className="text-xs leading-5 text-[#64748b]">
                Real-time sign recognition automatically captures
                visible hand gestures and sends recognized signs for
                translation and voice output.
              </p>
            </div>
          </div>

          {/* =============================
              Right side
          ============================== */}

          <div className="flex flex-col gap-6">

            {/* Recognized text */}
            <div className="rounded-2xl border border-[#d7e5f4] bg-white p-5 shadow-[0_10px_28px_rgba(30,64,175,0.06)] md:p-6">

              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">

                <div>
                  <h2 className="text-base font-semibold text-[#172033]">
                    Recognized text
                  </h2>

                  <p className="mt-1 text-xs text-[#64748b]">
                    Your detected signs appear here.
                  </p>
                </div>

                {isSpeaking ? (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-1.5 text-xs font-semibold text-[#1d4ed8]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2563eb]" />
                    Speaking
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#dbe7f5] bg-[#f8fbff] px-3 py-1.5 text-xs font-medium text-[#64748b]">
                    ElevenLabs voice
                  </span>
                )}
              </div>

              <textarea
                value={recognizedText}
                onChange={(e) =>
                  setRecognizedText(
                    e.target.value
                  )
                }
                placeholder="Recognized sign language text will appear here..."
                className="min-h-[145px] w-full resize-none rounded-xl border border-[#dbe7f5] bg-[#f8fbff] p-4 text-sm leading-6 text-[#172033] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#60a5fa] focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              {/* Text controls */}
              <div className="mt-4 flex flex-wrap items-center gap-2">

                <button
                  onClick={handleManualSpeak}
                  disabled={
                    !recognizedText.trim() ||
                    isSpeaking
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <VolumeIcon />
                  Speak voice
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStopSpeech}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fff7f7] px-4 py-2.5 text-xs font-semibold text-[#b91c1c] transition-colors hover:bg-[#fef2f2]"
                  >
                    <StopIcon />
                    Stop
                  </button>
                )}

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      recognizedText
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-[#dbe7f5] bg-white px-4 py-2.5 text-xs font-semibold text-[#526174] transition-colors hover:bg-[#f8fbff]"
                >
                  <CopyIcon />
                  Copy
                </button>

                <button
                  onClick={() => {
                    setRecognizedText("");
                    handleStopSpeech();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#dbe7f5] bg-white px-4 py-2.5 text-xs font-semibold text-[#526174] transition-colors hover:bg-[#f8fbff]"
                >
                  <TrashIcon />
                  Clear
                </button>
              </div>

              {/* Voice settings */}
              <div className="mt-5 border-t border-[#edf2f7] pt-4">

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="voice-select"
                      className="text-xs font-semibold text-[#526174]"
                    >
                      Voice
                    </label>

                    <select
                      id="voice-select"
                      value={selectedVoice}
                      onChange={(e) =>
                        setSelectedVoice(
                          e.target.value
                        )
                      }
                      className="rounded-lg border border-[#dbe7f5] bg-[#f8fbff] px-3 py-2 text-xs text-[#172033] outline-none focus:border-[#60a5fa] focus:ring-4 focus:ring-blue-50"
                    >
                      {ELEVENLABS_VOICES.map(
                        (voice) => (
                          <option
                            key={voice.id}
                            value={voice.id}
                          >
                            {voice.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <button
                    onClick={() =>
                      setAutoSpeak(!autoSpeak)
                    }
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      autoSpeak
                        ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]"
                        : "border-[#dbe7f5] bg-white text-[#64748b]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        autoSpeak
                          ? "bg-[#2563eb]"
                          : "bg-[#94a3b8]"
                      }`}
                    />

                    {autoSpeak
                      ? "Auto voice ON"
                      : "Auto voice OFF"}
                  </button>
                </div>

                <div className="mt-3 text-xs text-[#94a3b8]">
                  {speechProvider ===
                  "elevenlabs" ? (
                    <span className="font-medium text-[#2563eb]">
                      ✓ ElevenLabs HD Voice Active
                    </span>
                  ) : speechProvider ===
                    "web-speech" ? (
                    <span>
                      Web Speech Active
                    </span>
                  ) : (
                    <span>
                      Powered by ElevenLabs API
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Translator */}
            <div className="rounded-2xl border border-[#d7e5f4] bg-white p-5 shadow-[0_10px_28px_rgba(30,64,175,0.06)] md:p-6">

              <div className="mb-4 flex items-center justify-between gap-3">

                <div>
                  <h2 className="text-base font-semibold text-[#172033]">
                    Translator
                  </h2>

                  <p className="mt-1 text-xs text-[#64748b]">
                    Translate the recognized text.
                  </p>
                </div>

                {isTranslating && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[#eff6ff] px-3 py-1.5 text-xs font-semibold text-[#2563eb]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2563eb]" />
                    Translating...
                  </span>
                )}
              </div>

              {/* Language selection */}
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() =>
                      setLanguage(
                        lang.code
                      )
                    }
                    className={`rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
                      language === lang.code
                        ? "border-[#2563eb] bg-[#2563eb] text-white shadow-sm"
                        : "border-[#dbe7f5] bg-white text-[#526174] hover:border-[#bfd5ee] hover:bg-[#f8fbff] hover:text-[#1d4ed8]"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Translation output */}
              <div className="mt-4 min-h-[110px] rounded-xl border border-[#dbe7f5] bg-[#f8fbff] p-4 text-sm leading-6">

                {translateError ? (
                  <span className="text-xs font-medium text-[#b91c1c]">
                    {translateError}
                  </span>
                ) : translatedText ? (
                  <span className="text-[#172033]">
                    {translatedText}
                  </span>
                ) : (
                  <span className="text-xs text-[#94a3b8]">
                    The{" "}
                    {
                      LANGUAGES.find(
                        (l) =>
                          l.code ===
                          language
                      )?.label
                    }{" "}
                    translation of the recognized
                    text will appear here.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}