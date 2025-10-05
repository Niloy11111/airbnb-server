import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IImageFiles } from "../../interface/IImageFile";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IJwtPayload } from "../auth/auth.interface";
import { PropertyServices } from "./property.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyServices.createProperty(
    req.body,
    req.files as IImageFiles,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Property created successfully",
    data: result,
  });
});

const getAllProperties = catchAsync(async (req, res) => {
  const result = await PropertyServices.getAllProperties(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Propertiess are retrieved successfully",
    meta: result.meta,
    data: result.result,
  });
});

const getSingleProperty = catchAsync(async (req, res) => {
  const { propertyId } = req.params;
  const result = await PropertyServices.getSingleProperty(propertyId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Property retrieved successfully",
    data: result,
  });
});

const updateProperty = catchAsync(async (req, res) => {
  const {
    user,
    body: payload,
    params: { propertyId },
  } = req;

  const result = await PropertyServices.updateProperty(
    propertyId,
    payload,
    req.files as IImageFiles,
    user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Property updated successfully",
    data: result,
  });
});

// hard delete
const deleteProperty = catchAsync(async (req, res) => {
  const {
    user,
    params: { propertyId },
  } = req;

  const result = await PropertyServices.deleteProperty(
    propertyId,
    user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Property deleted successfully",
    data: result,
  });
});

export const PropertyController = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
};
