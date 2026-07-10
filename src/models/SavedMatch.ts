import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISavedMatch extends Document {
  userId: Types.ObjectId;
  savedBrandId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SavedMatchSchema = new Schema<ISavedMatch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    savedBrandId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

SavedMatchSchema.index({ userId: 1, savedBrandId: 1 }, { unique: true });

const SavedMatch: Model<ISavedMatch> =
  mongoose.models.SavedMatch || mongoose.model<ISavedMatch>("SavedMatch", SavedMatchSchema);

export default SavedMatch;
