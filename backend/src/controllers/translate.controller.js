// Proxies the free MyMemory translation API. Kept server-side so the
// frontend doesn't call a third-party API directly from the browser.

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

// POST /api/translate  { text, targetLang }
export const translateText = async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({
      success: false,
      message: "text and targetLang are required",
    });
  }

  try {
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(
      text
    )}&langpair=en|${targetLang}`;

    const response = await fetch(url);
    const data = await response.json();
    const translatedText = data?.responseData?.translatedText;

    if (!translatedText) {
      return res.status(502).json({
        success: false,
        message: "Translation unavailable.",
      });
    }

    return res.status(200).json({ success: true, translatedText });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't reach the translation service.",
    });
  }
};
