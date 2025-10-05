import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/appError";
import { IImageFiles } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import { FlashSale } from "../flashSell/flashSale.model";
import { Review } from "../review/review.model";

import User from "../user/user.model";

import { ILocation, IProperty } from "./property.interface";
import { Property } from "./property.model";

const createProperty = async (
  propertyData: Partial<IProperty>,
  propertyImages: IImageFiles,
  authUser: IJwtPayload
) => {
  // await db.collection("test").insertOne({ test: true });

  const { images } = propertyImages;
  if (!images || images.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Property images are required."
    );
  }

  console.log("images", images);

  propertyData.imageUrls = images.map((image) => image.path);

  (propertyData.location = {
    address: propertyData?.address,
    country: propertyData?.country,
    city: propertyData?.city,
    state: propertyData?.state,
    postalCode: propertyData?.postalCode,
    coordinates: propertyData?.coordinates,
  } as ILocation),
    //   const isCategoryExists = await Category.findById(propertyData.category);
    //   if (!isCategoryExists) {
    //     throw new AppError(StatusCodes.BAD_REQUEST, "Category does not exist!");
    //   }

    //   if (!isCategoryExists.isActive) {
    //     throw new AppError(StatusCodes.BAD_REQUEST, "Category is not active!");
    //   }
    console.log(propertyData);

  const { address, country, city, state, postalCode, coordinates, ...rest } =
    propertyData;

  const newProperty = new Property({
    ...rest,
  });

  console.log({ newProperty: newProperty, propertyData: propertyData });

  const result = await newProperty.save();
  return result;
};

const getAllProperties = async (query: Record<string, unknown>) => {
  const {
    minPrice,
    maxPrice,
    minSquareFeet,
    maxSquareFeet,
    categories,
    brands,
    inStock,
    ratings,
    location,
    checkIn,
    checkOut,
    guestCount,
    ...pQuery
  } = query;

  // Build the filter object
  const filter: Record<string, any> = {};

  if (checkIn && checkOut) {
    filter["availability.bookedDates"] = {
      $not: {
        $elemMatch: {
          $or: [{ checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } }],
        },
      },
    };
  }

  if (guestCount) {
    filter["capacity.maxGuests"] = { $gte: Number(guestCount) };
  }

  // Filter by categories
  if (categories) {
    const categoryArray =
      typeof categories === "string"
        ? categories.split(",")
        : Array.isArray(categories)
        ? categories
        : [categories];
    filter.category = { $in: categoryArray };
  }

  // Filter by brands
  if (brands) {
    const brandArray =
      typeof brands === "string"
        ? brands.split(",")
        : Array.isArray(brands)
        ? brands
        : [brands];
    filter.brand = { $in: brandArray };
  }

  // Filter by in stock/out of stock
  if (inStock !== undefined) {
    filter.stock = inStock === "true" ? { $gt: 0 } : 0;
  }

  // Filter by ratings
  if (ratings) {
    const ratingArray =
      typeof ratings === "string"
        ? ratings.split(",")
        : Array.isArray(ratings)
        ? ratings
        : [ratings];
    filter.averageRating = { $in: ratingArray.map(Number) };
  }

  if (location) {
    filter.$or = [
      { "location.address": { $regex: location, $options: "i" } },
      { "location.city": { $regex: location, $options: "i" } },
      { "location.state": { $regex: location, $options: "i" } },
      { "location.country": { $regex: location, $options: "i" } },
    ];
  }

  // console.log("filter", filter);
  // console.log("pquery", pQuery);

  const propertyQuery = new QueryBuilder(Property.find(filter), pQuery)
    .search(["name", "description"])
    .filter()
    .sort()
    // .paginate()
    .fields()
    .priceRange(Number(minPrice) || 0, Number(maxPrice) || Infinity)
    .squareFeetRange(
      Number(minSquareFeet) || 0,
      Number(maxSquareFeet) || Infinity
    );

  // console.log("here", minSquareFeet, maxSquareFeet);

  const properties = await propertyQuery.modelQuery.populate("landlord").lean();

  // console.log(properties);

  const meta = await propertyQuery.countTotal();

  // Get Flash Sale Discounts
  const propertyIds = properties.map((property: any) => property._id);

  const flashSales = await FlashSale.find({
    property: { $in: propertyIds },
    discountPercentage: { $gt: 0 },
  }).select("property discountPercentage");

  const flashSaleMap = flashSales.reduce(
    (acc, { property, discountPercentage }) => {
      //@ts-ignore
      acc[property.toString()] = discountPercentage;
      return acc;
    },
    {}
  );

  // Add offer price to properties
  const updatedproperties = properties.map((property: any) => {
    //@ts-ignore
    const discountPercentage = flashSaleMap[property._id.toString()];
    if (discountPercentage) {
      property.offerPrice = property.price * (1 - discountPercentage / 100);
    } else {
      property.offerPrice = null;
    }
    return property;
  });

  return {
    meta,
    result: updatedproperties,
  };
};

const getSingleProperty = async (propertyId: string) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError(StatusCodes.NOT_FOUND, "Property not found");
  }

  if (!property.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Property is not active");
  }

  // const offerPrice = await property.calculateOfferPrice();
  const reviews = await Review.find({ property: property._id });

  const propertyObj = property.toObject();

  return {
    ...propertyObj,
    // offerPrice,
    reviews,
  };
};

const updateProperty = async (
  propertyId: string,
  payload: Partial<IProperty>,
  propertyImages: IImageFiles,
  authUser: IJwtPayload
) => {
  const { images } = propertyImages;

  const user = await User.findById(authUser.userId);

  const property = await Property.findOne({
    _id: propertyId,
  });

  if (!user?.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active");
  }

  if (!property) {
    throw new AppError(StatusCodes.NOT_FOUND, "Property Not Found");
  }

  if (images && images.length > 0) {
    payload.imageUrls = images.map((image) => image.path);
  }

  return await Property.findByIdAndUpdate(propertyId, payload, { new: true });
};

const deleteProperty = async (propertyId: string, authUser: IJwtPayload) => {
  const user = await User.findById(authUser.userId);

  const property = await Property.findOne({
    _id: propertyId,
  });

  if (!user?.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active");
  }
  if (!property) {
    throw new AppError(StatusCodes.NOT_FOUND, "Property Not Found");
  }

  return await Property.findByIdAndDelete(propertyId);
};

export const PropertyServices = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
};
