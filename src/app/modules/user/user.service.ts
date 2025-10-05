import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import config from "../../config";
import AppError from "../../errors/appError";
import { IImageFile } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import { AuthService } from "../auth/auth.service";
import { createToken } from "../auth/auth.utils";
import { ICustomer } from "../customer/customer.interface";
import Customer from "../customer/customer.model";
import { UserSearchableFields } from "./user.constant";
import { IUser, UserRole } from "./user.interface";
import User from "./user.model";

// Function to register user
const registerUser = async (userData: IUser) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if ([UserRole.ADMIN].includes(userData.role)) {
      throw new AppError(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid role. Only User is allowed."
      );
    }

    // Check if the user already exists by email
    const existingUser = await User.findOne({ email: userData.email }).session(
      session
    );
    if (existingUser) {
      throw new AppError(
        StatusCodes.NOT_ACCEPTABLE,
        "Email is already registered"
      );
    }

    // Create the user
    const user = new User(userData);
    const createdUser = await user.save({ session });

    const profile = new Customer({
      user: createdUser._id,
    });

    await profile.save({ session });

    await session.commitTransaction();

    return {
      result: await AuthService.loginUser({
        email: createdUser.email,
        password: userData.password,
        clientInfo: userData.clientInfo,
      }),
      userData: createdUser,
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllUser = async (query: Record<string, unknown>) => {
  const UserQuery = new QueryBuilder(User.find(), query)
    .search(UserSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const users = await UserQuery.modelQuery;

  const result = users?.filter((user) => user?.isActive !== false);
  const meta = await UserQuery.countTotal();
  return {
    result,
    meta,
  };
};

const myProfile = async (authUser: IJwtPayload) => {
  const isUserExists = await User.findById(authUser.userId);
  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }
  if (!isUserExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
  }

  const profile = await Customer.findOne({ user: isUserExists._id });

  return {
    ...isUserExists.toObject(),
    profile: profile || null,
  };
};

const updateProfile = async (
  payload: Partial<ICustomer>,
  file: IImageFile,
  authUser: IJwtPayload
) => {
  const isUserExists = await User.findById(authUser.userId);

  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }
  if (!isUserExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
  }

  if (file && file.path) {
    payload.photo = file.path;
  }

  const result = await Customer.findOneAndUpdate(
    { user: authUser.userId },
    payload,
    {
      new: true,
    }
  ).populate("user");

  return result;
};
const updateUserProfile = async (
  payload: Partial<IUser>,
  file: IImageFile,
  authUser: IJwtPayload
) => {
  const user = await User.findById(authUser.userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }
  if (!user.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
  }

  if (payload?.role) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized to update role!"
    );
  }

  if (file && file.path) {
    payload.photo = file.path;
  }

  let tokens;
  if (payload?.email) {
    const jwtPayload: IJwtPayload = {
      userId: user._id as string,
      name: payload.name as string,
      email: payload.email as string,

      isActive: user.isActive,
      role: user.role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string
    );

    tokens = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  const result = await User.findByIdAndUpdate(authUser.userId, payload, {
    new: true,
  });

  return {
    updatedProfile: result,
    ...tokens,
  };
};

const updateUserStatus = async (
  userId: string,
  payload: { updatedRole?: UserRole; isDeleted?: string }
) => {
  console.log(payload);
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User is not found");
  }

  if (payload?.updatedRole) {
    user.role = payload.updatedRole;
  }

  if (payload?.isDeleted === "true") {
    user.isActive = false;
  }

  const { result } = await UserServices.getAllUser({});

  const updatedUser = await user.save();
  return {
    updatedUser,
    users: result,
  };
};

export const UserServices = {
  registerUser,
  getAllUser,
  myProfile,
  updateUserStatus,
  updateProfile,
  updateUserProfile,
};
