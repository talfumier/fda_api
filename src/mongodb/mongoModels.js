import mongoose from "mongoose";
/*TOKENS FOR USER PASSWORD RESET*/
const TokenSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, //token is automatically deleted after 300s >>> mongosh command : db.tokens.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 300 } )
  },
});
export const Token = mongoose.model("Token", TokenSchema);
