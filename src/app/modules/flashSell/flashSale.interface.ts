import { Types } from "mongoose";

export interface IFlashSale {
  property: Types.ObjectId;
  discountPercentage: number;
  createdBy?: Types.ObjectId;
}

export interface ICreateFlashSaleInput {
  properties: string[];
  discountPercentage: number;
}
