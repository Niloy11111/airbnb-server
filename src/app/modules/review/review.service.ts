import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/appError";
import { Property } from "../property/property.model";
import { IReview } from "./review.interface";
import { Review } from "./review.model";

//@ need to fix
const createReview = async (payload: IReview, user: JwtPayload) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingReview = await Review.findOne(
      {
        user: user.userId,
        property: payload.property,
      },
      null,
      { session }
    );

    if (existingReview) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "You have already reviewed this property."
      );
    }

    const review = await Review.create([{ ...payload, user: user.userId }], {
      session,
    });

    // Aggregate reviews for the property
    const reviews = await Review.aggregate([
      {
        $match: {
          property: review[0].property,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 },
        },
      },
    ]);

    const { averageRating = 0, ratingCount = 0 } = reviews[0] || {};

    const updatedProperty = await Property.findByIdAndUpdate(
      payload.property,
      { averageRating, ratingCount },
      { session, new: true }
    );

    if (!updatedProperty) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "Property not found during rating update."
      );
    }

    await session.commitTransaction();
    return review;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const getAllReviews = async (query: Record<string, unknown>) => {
  const brandQuery = new QueryBuilder(
    Review.find().populate("property user"),
    query
  )
    .search(["review"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await brandQuery.modelQuery;
  const meta = await brandQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const ReviewServices = {
  createReview,
  getAllReviews,
};
