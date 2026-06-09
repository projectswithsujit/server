const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// ✅ IMPORTANT: Render uses dynamic PORT
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🧪 Test route
app.get("/", (req, res) => {
  res.send("Summarizer API running 🚀");
});


// 🤖 Groq helper function (reusable)
async function callGroq(prompt) {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
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

  return response.data.choices[0].message.content;
}


// 🤖 Summarize route
app.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const summary = await callGroq(
      `Summarize this text simply and clearly:\n\n${text}`
    );

    res.json({ summary });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Summarization failed" });
  }
});


// 🍳 Recipe route
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

    const recipe = await callGroq(`
You are a professional chef AI.

Create a simple recipe using ONLY these ingredients:
${ingredientList}

Rules:
- Use only given ingredients (basic pantry items like salt, pepper, oil allowed)
- Give a recipe name
- Provide ingredients list
- Provide step-by-step instructions
- Keep it simple and beginner friendly
    `);

    res.json({ recipe });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Recipe generation failed" });
  }
});


// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
