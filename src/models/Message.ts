import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  attachments: string[];
  readAt?: Date;
  isDeleted?: boolean;
  isEdited?: boolean;
  reactions?: { emoji: string; userId: Types.ObjectId }[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    attachments: [{ type: String }],
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      }
    ],
  },
  { timestamps: true },
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
