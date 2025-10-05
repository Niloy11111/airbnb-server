import { Schema, model } from "mongoose";
import { FlashSale } from "../flashSell/flashSale.model";
import { IProperty } from "./property.interface";
import { getCoordinates } from "./property.utils";

const propertySchema = new Schema<IProperty>(
  {
    name: {
      type: String,
      required: [true, "Property name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Property slug is required"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Property price is required"],
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: [true, "securityDeposit price is required"],
      min: 0,
    },
    applicationFee: {
      type: Number,
      required: [true, "applicationFee price is required"],
      min: 0,
    },
    beds: {
      type: Number,
      required: [true, "beds is required"],
      min: 0,
    },
    baths: {
      type: Number,
      required: [true, "baths is required"],
      min: 0,
    },
    squareFeet: {
      type: Number,
      required: [true, "squareFeet is required"],
      min: 0,
    },
    imageUrls: {
      type: [String],
      required: [true, "Property images are required"],
    },
    amenities: {
      type: String,
      required: [true, "amenities are required"],
    },
    highlights: {
      type: String,
      required: [true, "highlights are required"],
    },
    propertyType: {
      type: String,
      required: [true, "propertyType are required"],
    },
    isPetsAllowed: {
      type: Boolean,
      default: true,
    },
    isParkingIncluded: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    landlord: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User who created the rental is required"],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    location: {
      address: {
        type: String,
        required: [true, "address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "state is required"],
      },
      country: {
        type: String,
        required: [true, "country is required"],
      },
      postalCode: {
        type: String,
        required: [true, "postalCode is required"],
      },
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: [Number], // Array format: [longitude, latitude]
      },
    },

    specification: {
      type: Schema.Types.Mixed,
      default: {},
    },
    keyFeatures: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true }
  }
);

propertySchema.index({ "coordinates.coordinates": "2dsphere" });

// Middleware to auto-generate the slug before saving
propertySchema.pre<IProperty>("validate", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next();
});

propertySchema.methods.calculateOfferPrice = async function () {
  const flashSale = await FlashSale.findOne({ property: this._id });

  if (flashSale) {
    const discount = (flashSale.discountPercentage / 100) * this.price;
    return this.price - discount;
  }

  return null; // or you can return 0 or another default value
};

propertySchema.pre("save", async function (next) {
  if (this.location.address) {
    const { lat, lng } = await getCoordinates(
      this.location.address,
      this.location.city
    );
    // console.log("cor", { latitude: lat, longitude: lng });
    this.location.coordinates = {
      type: "Point",
      coordinates: [lng, lat], // Store as array [longitude, latitude]
    };
  }
  next();
});

// async function result() {
//   const coordinates = await getCoordinates("Mirpur,Dhaka");
//   console.log("cor", coordinates);
// }

// result();

export const Property = model<IProperty>("Property", propertySchema);
