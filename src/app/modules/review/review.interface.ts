import { Schema } from "mongoose";

export interface IReview {
  review: string;
  rating: number;
  user: Schema.Types.ObjectId;
  property: Schema.Types.ObjectId;
  isFlagged?: boolean;
  flaggedReason?: string;
  isVerifiedPurchase?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
