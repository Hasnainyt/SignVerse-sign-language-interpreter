// Sign Language Recognition Controller
// Forwards frames to Python ML service (MediaPipe + RandomForest).
// Handles "no hand detected" gracefully so it stays silent when hands stop.

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// POST /api/recognize { frame: "data:image/jpeg;base64,...", hasHand: boolean }
export const recognizeFrame = async (req, res) => {
  const { frame, hasHand } = req.body;

  if (!frame) {
    return res.status(400).json({ success: false, message: "frame is required" });
  }

  // If frontend explicitly reports no hands in frame, return null immediately
  if (hasHand === false) {
    return res.status(200).json({
      success: true,
      data: null,
      message: "No hand detected in frame",
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frame }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // Respect Python ML service returning data: null when no hands detected
      return res.status(200).json(data);
    }

    return res.status(502).json({
      success: false,
      message: "ML service returned an error.",
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "ML service is unavailable. Please try again shortly.",
    });
  }
};
