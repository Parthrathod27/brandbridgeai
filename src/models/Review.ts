import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReview extends Document {
  hireId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  rating: number;
  text?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    hireId: { type: Schema.Types.ObjectId, ref: "Hire", required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: String,
  },
  { timestamps: true }
);

ReviewSchema.index({ hireId: 1 }, { unique: true }); // One review per hire
ReviewSchema.index({ freelancerId: 1 });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
