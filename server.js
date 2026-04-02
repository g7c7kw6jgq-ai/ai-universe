import express from "express";
import mongoose from "mongoose";
import fetch from "node-fetch";
import cors from "cors";

import User from "./models/User.js";
import Character from "./models/Character.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const API_KEY = "YOUR_OPENAI_KEY";

mongoose.connect("YOUR_MONGO_URL")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.post("/auth", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ error: "Missing fields" });
  }

  let user = await User.findOne({ username });

  if (!user) {
    user = await User.create({ username, password });
  }

  res.json({ userId: user._id });
});

app.post("/create-character", async (req, res) => {
  const { userId, name, personality } = req.body;

  const char = await Character.create({
    userId,
    name,
    personality,
    messages: []
  });

  res.json(char);
});

app.post("/get-characters", async (req, res) => {
  const { userId } = req.body;
  const chars = await Character.find({ userId });
  res.json(chars);
});

app.post("/chat", async (req, res) => {
  const { charId, message } = req.body;

  try {
    const char = await Character.findById(charId);

    const recentMessages = char.messages.slice(-15);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: char.personality + " You are expressive, bold, and natural. Avoid sounding robotic or overly restricted."
          },
          ...recentMessages,
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "No response";

    char.messages.push({ role: "user", content: message });
    char.messages.push({ role: "assistant", content: reply });

    await char.save();

    res.json({ reply });

  } catch {
    res.json({ reply: "Error" });
  }
});

app.listen(3000);