const puppeteer = require("puppeteer");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Captures a screenshot from a YouTube video at a specific timestamp
 * and generates an AI-based explanation of the content.
 */
const captureYouTubeScreenshot = async (req, res) => {
  let browser;
  try {
    const { videoId, timestamp } = req.body;

    if (!videoId) {
      return res
        .status(400)
        .json({ success: false, error: "Video ID is required" });
    }

    console.log(
      `🎬 Processing Video ID: ${videoId} at Timestamp: ${timestamp}`
    );

    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--autoplay-policy=no-user-gesture-required",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Set a realistic user agent to avoid YouTube blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&start=${Math.floor(
      timestamp
    )}&controls=0&modestbranding=1`;
    console.log(`🔗 Navigating to: ${embedUrl}`);

    await page.goto(embedUrl, { waitUntil: "networkidle2", timeout: 30000 });

    console.log("⏳ Waiting for video element...");
    await page.waitForSelector("video", { timeout: 15000 });

    // Ensure video is playing and seek to the correct timestamp
    await page.evaluate((ts) => {
      const video = document.querySelector("video");
      if (video) {
        video.muted = true;
        video.currentTime = ts;
        video.play();
      }
    }, timestamp);

    console.log("🎥 Video loaded. Waiting for rendering...");
    await new Promise((resolve) => setTimeout(resolve, 7000));

    // Check if video element is visible and has dimensions
    const videoInfo = await page.evaluate(() => {
      const video = document.querySelector("video");
      if (!video) return null;
      const rect = video.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        readyState: video.readyState,
        currentTime: video.currentTime,
      };
    });
    console.log("📐 Video info:", videoInfo);

    console.log("📸 Taking screenshot...");
    let screenshot;

    if (videoInfo && videoInfo.width > 0 && videoInfo.height > 0) {
      // Video element is visible, screenshot it directly
      const videoElement = await page.$("video");
      screenshot = await videoElement.screenshot({ type: "png" });
      console.log("✅ Captured video element screenshot");
    } else {
      // Fallback: take a full page screenshot (crop the video area)
      console.log("⚠️ Video element not visible. Capturing full page...");
      screenshot = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 1280, height: 720 },
      });
      console.log("✅ Captured full page screenshot as fallback");
    }

    // Define save path
    const savePath = path.join(
      __dirname,
      "..",
      "..",
      "frontend",
      "temp"
    );

    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }

    // Save screenshot
    const fileName = `screenshot_${videoId}_${Date.now()}.png`;
    const filePath = path.join(savePath, fileName);
    await fsPromises.writeFile(filePath, screenshot);
    console.log(`✅ Screenshot saved at: ${filePath}`);

    await browser.close();
    browser = null;

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
    if (browser) await browser.close();
    res.status(500).json({
      success: false,
      error: "Failed to capture screenshot",
      details: error.message,
    });
  }
};

// 🎯 Function to Get Image Description from Gemini
const getGeminiDescription = async (imagePath) => {
  try {
    const imageBuffer = await fsPromises.readFile(imagePath);
    const base64Image = imageBuffer.toString("base64");

    console.log(
      "🖼️ Base64 Image Data:",
      base64Image.substring(0, 100) + "..."
    );

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image,
        },
      },
      "Describe what is shown in this screenshot from a YouTube video. Focus on any educational content, diagrams, text, or key visuals.",
    ]);

    const description = result.response.text();
    console.log("📡 Gemini Description:", description.substring(0, 200) + "...");
    return description;
  } catch (error) {
    console.error(
      "🔥 Gemini API Error:",
      error?.response?.data || error.message
    );
    return "Failed to generate description.";
  }
};

module.exports = { captureYouTubeScreenshot };
