// ElevenLabs Text-to-Speech Integration Service
export const DEFAULT_ELEVENLABS_KEY =
  import.meta.env.VITE_ELEVENLABS_API_KEY;

export const ELEVENLABS_VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Reassuring Female)" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice (Engaging Educator)" },
  { id: "hpp4J3VqNfWAUOO0d1Us", name: "Bella (Professional Female)" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (Firm Male)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (Warm Male)" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger (Casual Male)" },
];

let currentAudio = null;

export function playWebSpeechFallback(text) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      return resolve(false);
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speakText(
  text,
  voiceId = "EXAVITQu4vr4xnSDxMaL",
  apiBaseUrl = "http://localhost:5000"
) {
  if (!text || !text.trim()) return { success: false, provider: null };

  const cleanText = text.trim();
  stopSpeech();

  // 1. Try Backend API
  try {
    const res = await fetch(`${apiBaseUrl}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText, voiceId }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          resolve({ success: true, provider: "elevenlabs" });
        };
        audio.onerror = async () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          const fallbackSuccess = await playWebSpeechFallback(cleanText);
          resolve({ success: fallbackSuccess, provider: "web-speech" });
        };
        audio.play().catch(async () => {
          const fallbackSuccess = await playWebSpeechFallback(cleanText);
          resolve({ success: fallbackSuccess, provider: "web-speech" });
        });
      });
    }
  } catch (backendError) {}

  // 2. Direct ElevenLabs API
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": DEFAULT_ELEVENLABS_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          resolve({ success: true, provider: "elevenlabs" });
        };
        audio.onerror = async () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          const fallbackSuccess = await playWebSpeechFallback(cleanText);
          resolve({ success: fallbackSuccess, provider: "web-speech" });
        };
        audio.play().catch(async () => {
          const fallbackSuccess = await playWebSpeechFallback(cleanText);
          resolve({ success: fallbackSuccess, provider: "web-speech" });
        });
      });
    }
  } catch (directApiError) {}

  // 3. Fallback
  const fallbackSuccess = await playWebSpeechFallback(cleanText);
  return { success: fallbackSuccess, provider: "web-speech" };
}