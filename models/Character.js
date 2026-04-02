import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
  userId: String,
  name: String,
  personality: String,
  messages: [
    {
      role: String,
      content: String
    }
  ]
});

export default mongoose.model("Character", characterSchema);
