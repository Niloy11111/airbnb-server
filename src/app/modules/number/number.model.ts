import { Schema, model } from "mongoose";
import { IPhoneNumber } from "./number.interface";

const phoneNumberSchema = new Schema<IPhoneNumber>(
  {
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^\d{11}$/.test(v);
        },
        message: "Phone number must be 11 digits long",
      },
    },
  },
  { timestamps: true }
);

const PhoneNumber = model<IPhoneNumber>("PhoneNumber", phoneNumberSchema);

export default PhoneNumber;
