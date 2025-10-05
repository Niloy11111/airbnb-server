import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/appError";
import { IPhoneNumber } from "../number/number.interface";
import PhoneNumber from "../number/number.model";

import { Property } from "../property/property.model";
import User from "../user/user.model";
import { IApplication } from "./application.interface";
import Application from "./application.model";

const createApplication = async (
  payload: IApplication
): Promise<IApplication> => {
  const user = await User.findById(payload?.tenant);

  console.log(payload);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "This user is not found!");
  }
  if (payload?.email !== user?.email) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User information:Email is not correct!"
    );
  }
  if (payload?.name !== user?.name) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User information:Name is not correct!"
    );
  }
  const property = await Property.findById(payload?.property);

  if (!property) {
    throw new AppError(StatusCodes.NOT_FOUND, "This property is not found!");
  }

  payload.applicationDate = new Date().toISOString();

  // console.log(payload);

  const application = await Application.create(payload);
  return application;
};

const sendNumberToTenant = async (
  payload: IPhoneNumber
): Promise<IPhoneNumber> => {
  // console.log(payload);
  console.log("here");
  const phoneNumber = await PhoneNumber.create(payload);
  return phoneNumber;
};

const getAllApplications = async (query: Record<string, unknown>) => {
  const { ...pQuery } = query;

  // Build the filter object
  const filter: Record<string, any> = {};

  // console.log("pquery", pQuery);

  const propertyQuery = new QueryBuilder(Application.find(filter), pQuery)
    .filter()
    .sort()
    .paginate()
    .fields();

  // console.log("here", minSquareFeet, maxSquareFeet);

  const properties = await propertyQuery.modelQuery
    .populate("property")
    .populate("tenant")
    .populate({ path: "property", populate: { path: "landlord" } })
    .lean();

  const meta = await propertyQuery.countTotal();

  // const individualApplications = properties?.filter()

  return {
    meta,
    result: properties,
  };
};

const updateApplication = async (
  applicationId: string,
  payload: { status: string; landlordContactNumber?: string }
) => {
  const property = await Application.findOne({
    _id: applicationId,
  });

  if (!property) {
    throw new AppError(StatusCodes.NOT_FOUND, "Application Not Found");
  }
  console.log("payload", payload);

  if (payload?.landlordContactNumber) {
    const isValid = /^\d{11}$/.test(payload.landlordContactNumber);
    if (!isValid) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Invalid phone number format"
      );
    }
  }

  if (payload?.status === "Approved") {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 4);
    Object.assign(payload, {
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString(),
      nextPaymentDate: startDate.toDateString(),
    });
  }

  return await Application.findByIdAndUpdate(applicationId, payload, {
    new: true,
  });
};

export const ApplicationServices = {
  createApplication,
  getAllApplications,
  updateApplication,
  sendNumberToTenant,
};
