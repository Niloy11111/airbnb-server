import { Schema, model } from "mongoose";

import { Coupon } from "../coupon/coupon.model";
import { Property } from "../property/property.model";
import { IOrder } from "./order.interface";

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    properties: [
      {
        property: {
          type: Schema.Types.ObjectId,
          ref: "Property",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
      },
    ],
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "Online",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate total, discount, delivery charge, and final price
orderSchema.pre("validate", async function (next) {
  const order = this;

  // Step 1: Initialize total amount
  let totalAmount = 0;
  let finalDiscount = 0;

  // Step 2: Calculate total amount for propertys
  for (let item of order.properties) {
    const property = await Property.findById(item.property);

    if (!property) {
      return next(new Error(`Property not found!.`));
    }

    // const offerPrice = (await property?.calculateOfferPrice()) || 0;
    const offerPrice = 0;

    let propertyPrice = property.price;
    if (offerPrice) propertyPrice = Number(offerPrice);

    item.unitPrice = propertyPrice;
    const price = propertyPrice * item.quantity;
    console.log(price);
    totalAmount += price;
  }

  if (order.coupon) {
    const couponDetails = await Coupon.findById(order.coupon);

    if (couponDetails && couponDetails.isActive) {
      if (totalAmount >= couponDetails.minOrderAmount) {
        if (couponDetails.discountType === "Percentage") {
          finalDiscount = Math.min(
            (couponDetails.discountValue / 100) * totalAmount,
            couponDetails.maxDiscountAmount
              ? couponDetails.maxDiscountAmount
              : Infinity
          );
        } else if (couponDetails.discountType === "Flat") {
          finalDiscount = Math.min(couponDetails.discountValue, totalAmount);
        }
      }
    }
  }

  // const isDhaka = order?.shippingAddress?.toLowerCase()?.includes("dhaka");
  // const deliveryCharge = isDhaka ? 60 : 120;

  order.totalAmount = totalAmount;
  order.discount = finalDiscount;
  // order.deliveryCharge = deliveryCharge;
  order.finalAmount = totalAmount - finalDiscount;

  next();
});

export const Order = model<IOrder>("Order", orderSchema);
