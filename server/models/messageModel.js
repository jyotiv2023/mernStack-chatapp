import mongoose from "mongoose";

//lld: this schema will have three things -
//1.Name of the sender or id of the sender,
//2.content of the message,
//3.ref to the chat , to which the message belongs

const messageModel = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  },
  {
    timeStamps: true,
  }
);
const Message = mongoose.model("Message", messageModel);
export default Message;
