import { Schema, model } from "mongoose";
import { IApplication } from "./application.interface";

const ApplicationSchema = new Schema<IApplication>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^\d{11}$/.test(v);
        },
        message: "Phone number must be 11 digits long",
      },
    },
    landlordContactNumber: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: [true, "message is required"],
      trim: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is required"],
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property id is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Completed", "Cancelled"],
      default: "Pending",
    },
    applicationDate: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    nextPaymentDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Application = model<IApplication>("Application", ApplicationSchema);

export default Application;
