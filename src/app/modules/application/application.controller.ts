import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ApplicationServices } from "./application.service";

const createApplication = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationServices.createApplication(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Application created successfully",
    data: result,
  });
});
const sendNumberToTenant = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationServices.sendNumberToTenant(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Phone Number Sent successfully",
    data: result,
  });
});

const getAllApplications = catchAsync(async (req, res) => {
  const result = await ApplicationServices.getAllApplications(req.query);
  // const user = req?.user;

  // const individualApplications = result?.result?.filter(application => application?.email ===  user?.email)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Application are retrieved successfully",
    meta: result.meta,
    data: result.result,
  });
});

const updateApplication = catchAsync(async (req, res) => {
  const {
    body: payload,
    params: { applicationId },
  } = req;

  const result = await ApplicationServices.updateApplication(
    applicationId,
    payload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Application status updated successfully",
    data: result,
  });
});

export const ApplicationController = {
  createApplication,
  getAllApplications,
  sendNumberToTenant,
  updateApplication,
};
