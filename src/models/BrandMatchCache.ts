import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBrandMatchCache extends Document {
  brandA: Types.ObjectId;
  brandB: Types.ObjectId;
  compatibilityScore: number;
  scoreBreakdown: {
    audienceOverlap: number;
    categoryRelevance: number;
    budgetCompatibility: number;
  };
  audienceMatch: string;
  campaignSuggestions: string[];
  marketingStrategy: string;
  suggestedFreelancerCategories: string[];
  estimatedReach: string;
  matchedAt: Date;
}

const BrandMatchCacheSchema = new Schema<IBrandMatchCache>(
  {
    brandA: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brandB: { type: Schema.Types.ObjectId, ref: "User", required: true },
    compatibilityScore: { type: Number, required: true },
    scoreBreakdown: {
      audienceOverlap: { type: Number, required: true },
      categoryRelevance: { type: Number, required: true },
      budgetCompatibility: { type: Number, required: true },
    },
    audienceMatch: { type: String, required: true },
    campaignSuggestions: [{ type: String }],
    marketingStrategy: { type: String, required: true },
    suggestedFreelancerCategories: [{ type: String }],
    estimatedReach: { type: String, required: true },
    matchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// We always query by brandA and brandB
BrandMatchCacheSchema.index({ brandA: 1, brandB: 1 }, { unique: true });

const BrandMatchCache: Model<IBrandMatchCache> =
  mongoose.models.BrandMatchCache || mongoose.model<IBrandMatchCache>("BrandMatchCache", BrandMatchCacheSchema);

export default BrandMatchCache;
