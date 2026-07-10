import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IParticipantState {
  userId: Types.ObjectId;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
}

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  relatedEntityType?: "collaboration" | "freelancer_hire" | "product_promotion";
  relatedEntityId?: Types.ObjectId;
  participantStates: IParticipantState[];
  lastMessageAt: Date;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantStateSchema = new Schema<IParticipantState>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    unreadCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    relatedEntityType: {
      type: String,
      enum: ["collaboration", "freelancer_hire", "product_promotion"],
    },
    relatedEntityId: { type: Schema.Types.ObjectId },
    participantStates: [ParticipantStateSchema],
    lastMessageAt: { type: Date, default: Date.now },
    lastMessage: String,
  },
  { timestamps: true },
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
