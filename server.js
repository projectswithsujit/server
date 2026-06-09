const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT =5000;

app.use(cors());
app.use(express.json());

// 🧪 test route
app.get("/", (req, res) => {
  res.send("Summarizer API running 🚀");
});

app.post("/recipe", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res.status(400).json({
        error: "Ingredients array is required",
      });
    }

    const ingredientList = ingredients.join(", ");

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `
You are a professional chef AI.

Create a simple recipe using ONLY these ingredients:
${ingredientList}

Rules:
- Use only given ingredients (basic pantry items like salt, pepper, oil allowed)
- Give a recipe name
- Provide ingredients list
- Provide step-by-step instructions
- Keep it simple and beginner friendly
            `,
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

    const recipe = response.data.choices[0].message.content;

    res.json({ recipe });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Recipe generation failed" });
  }
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
