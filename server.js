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
