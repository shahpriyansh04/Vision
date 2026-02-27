const puppeteer = require("puppeteer");
const fs = require("fs").promises; // Use fs.promises for async handling
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Captures a screenshot from a YouTube video at a specific timestamp
 * and generates an AI-based explanation of the content.
 */
exports.captureYouTubeScreenshot = async (req, res) => {
  try {
    const { videoId, timestamp } = req.body;

    if (!videoId) {
      return res.status(400).json({ success: false, error: "Video ID is required" });
    }

    console.log(`🎬 Processing Video ID: ${videoId} at Timestamp: ${timestamp}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${Math.floor(timestamp)}`;
    console.log(`🔗 Navigating to: ${embedUrl}`);

    await page.goto(embedUrl, { waitUntil: "networkidle2" });

    console.log("⏳ Waiting for video element...");
    await page.waitForSelector("video", { timeout: 15000 });

    // Ensure video is playing
    await page.evaluate(() => {
      const video = document.querySelector("video");
      if (video) {
        video.muted = true;
        video.play();
      }
    });

    console.log("🎥 Video loaded. Waiting for rendering...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("📸 Taking screenshot...");
    const videoElement = await page.$("video");

    let screenshot;
    if (videoElement) {
      screenshot = await videoElement.screenshot({ type: "png" });
    } else {
      console.log("⚠️ Video element not found. Capturing full page...");
      screenshot = await page.screenshot({ type: "png", fullPage: false });
    }

    await browser.close();

    // ✅ Restore saving in `frontend/temp` directory
    const savePath = `C:\\Users\\admin\\Desktop\\Synergy\\LinearDepression_PriyanshShah\\frontend\\temp`;
    await fs.mkdir(savePath, { recursive: true });

    // Save screenshot
    const fileName = `screenshot_${videoId}_${Date.now()}.png`;
    const filePath = path.join(savePath, fileName);
    await fs.writeFile(filePath, screenshot);
    console.log(`✅ Screenshot saved at: ${filePath}`);

    // 🔥 Call Gemini API to describe the image
    const description = await getGeminiDescription(filePath);

    res.json({
      success: true,
      message: "Screenshot saved successfully",
      filePath,
      description,
    });

  } catch (error) {
    console.error("❌ Screenshot error:", error);
    res.status(500).json({ success: false, error: "Failed to capture screenshot", details: error.message });
  }
};

/**
 * Calls Gemini API to describe an image
 */
const getGeminiDescription = async (imagePath) => {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const prompt = `Analyze this YouTube video screenshot and describe what is happening in detail.
    Return the response in this exact JSON format:
    {
      "scene": "<Give the description of any study things that are shown on the screen- any diagrams or some equations or some text on the screen only related to studying nothing else.Explain anything about the diagram or text or equation>",
      "objects": ["<List of key objects visible in the screenshot>"],
      "possible_topic": "<What this video might be about>",
      "contextual_info": "<Additional details based on what is seen in the image>"
    }`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "image/png", data: imageBase64 } }
    ]);

    let responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("📡 Raw Gemini API Response:", responseText);

    // ✅ Remove triple backticks (` ```json `) and trim the response
    responseText = responseText.replace(/```json|```/g, "").trim();

    // ✅ Attempt to parse JSON safely
    const jsonResponse = JSON.parse(responseText);
    console.log("✅ Parsed JSON Response:", jsonResponse);

    return jsonResponse;

  } catch (error) {
    console.error("🔥 Gemini API Error:", error);
    return { error: "Failed to generate description due to invalid JSON format." };
  }
};
