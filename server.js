const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🧪 test route
app.get("/", (req, res) => {
  res.send("Summarizer API running 🚀");
});

// 🤖 Summarize route
app.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Summarize this text simply and clearly:\n\n${text}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 🧠 extract only summary text
    const summary = response.data.choices[0].message.content;

    // ✅ send clean response
    res.json({ summary });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Summarization failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});