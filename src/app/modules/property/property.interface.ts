import { Document, Types } from "mongoose";

export interface ICoordinates {
  type: string;
  coordinates: number[];
}
export interface ILocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: ICoordinates;
}

export interface IProperty extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  securityDeposit?: number;
  applicationFee?: number;
  beds: number;
  baths: number;
  squareFeet: number;
  highlights: string;
  amenities: string;
  imageUrls: string[];
  isActive: boolean;
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  propertyType: string;
  landlord: Types.ObjectId;
  averageRating?: number;
  ratingCount?: number;
  numberOfReviews?: number;
  location: ILocation;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: ICoordinates;
  specification: Record<string, any>;
  keyFeatures: string[];
  createdAt?: Date;
  updatedAt?: Date;
  reviews?: Record<string, any> | [];
}
