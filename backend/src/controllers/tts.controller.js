const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.warn("ELEVENLABS_API_KEY is not set — TTS requests will fail.");
}

export const PREMADE_VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Female - Reassuring)", gender: "female" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice (Female - Clear Educator)", gender: "female" },
  { id: "hpp4J3VqNfWAUOO0d1Us", name: "Bella (Female - Professional)", gender: "female" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (Male - Firm)", gender: "male" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (Male - Warm)", gender: "male" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger (Male - Casual)", gender: "male" },
];

export const getVoices = (req, res) => {
  return res.status(200).json({
    success: true,
    voices: PREMADE_VOICES,
  });
};

export const generateSpeech = async (req, res) => {
  const { text, voiceId } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: "text parameter is required",
    });
  }

  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "TTS is not configured on the server.",
    });
  }

  const selectedVoiceId = voiceId || "EXAVITQu4vr4xnSDxMaL";

  try {
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;

    const response = await fetch(elevenLabsUrl, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        message: errorData?.detail?.message || "ElevenLabs speech generation failed.",
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length,
      "Cache-Control": "public, max-age=3600",
    });

    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during speech synthesis.",
    });
  }
};