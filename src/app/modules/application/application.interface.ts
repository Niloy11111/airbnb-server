import { Types } from "mongoose";

export interface IApplication extends Document {
  email: string;
  name: string;
  phoneNumber: string;
  message?: string;
  status: "Pending" | "Paid" | "Shipped" | "Completed" | "Cancelled";
  property: Types.ObjectId;
  tenant: Types.ObjectId;
  applicationDate: string;
  endDate: string;
  startDate: string;
  nextPaymentDate: string;
  landlordContactNumber?: string;
}
