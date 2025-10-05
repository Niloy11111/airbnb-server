import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/appError";
import { IJwtPayload } from "../auth/auth.interface";
import { Coupon } from "../coupon/coupon.model";
import { Payment } from "../payment/payment.model";
import { generateTransactionId } from "../payment/payment.utils";
import { Property } from "../property/property.model";
import { sslService } from "../sslcommerz/sslcommerz.service";
import { IOrder } from "./order.interface";
import { Order } from "./order.model";

const createOrder = async (
  orderData: Partial<IOrder>,
  authUser: IJwtPayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (orderData.properties) {
      for (const propertyItem of orderData.properties) {
        const property = await Property.findById(propertyItem.property).session(
          session
        );

        if (property) {
          if (property.isActive === false) {
            throw new Error(`property ${property?.name} is inactive.`);
          }

          // if (property.stock < propertyItem.quantity) {
          //   throw new Error(`Insufficient stock for property: ${property.name}`);
          // }
          // Decrement the property stock
          // property.stock -= propertyItem.quantity;
          await property.save({ session });
        } else {
          throw new Error(`property not found: ${propertyItem.property}`);
        }
      }
    }

    // Handle coupon and update orderData
    if (orderData?.coupon) {
      const coupon = await Coupon.findOne({ code: orderData.coupon }).session(
        session
      );
      if (coupon) {
        const currentDate = new Date();

        // Check if the coupon is within the valid date range
        if (currentDate < coupon.startDate) {
          throw new Error(`Coupon ${coupon.code} has not started yet.`);
        }

        if (currentDate > coupon.endDate) {
          throw new Error(`Coupon ${coupon.code} has expired.`);
        }

        orderData.coupon = coupon._id as Types.ObjectId;
      } else {
        throw new Error("Invalid coupon code.");
      }
    }

    // Create the order
    const order = new Order({
      ...orderData,
      user: authUser.userId,
    });

    const createdOrder = await order.save({ session });
    await createdOrder.populate("user properties.property");

    const transactionId = generateTransactionId();

    const payment = new Payment({
      user: authUser.userId,

      order: createdOrder._id,
      method: orderData.paymentMethod,
      transactionId,
      amount: createdOrder.finalAmount,
    });

    await payment.save({ session });

    let result;

    if (createdOrder.paymentMethod == "Online") {
      result = await sslService.initPayment({
        total_amount: createdOrder.finalAmount,
        tran_id: transactionId,
      });
      result = { paymentUrl: result };
    } else {
      result = order;
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // const pdfBuffer = await generateOrderInvoicePDF(createdOrder);
    // const emailContent = await EmailHelper.createEmailContent(
    //   //@ts-ignore
    //   { userName: createdOrder.user.name || "" },
    //   "orderInvoice"
    // );

    // const attachment = {
    //   filename: `Invoice_${createdOrder._id}.pdf`,
    //   content: pdfBuffer,
    //   encoding: "base64", // if necessary
    // };

    // await EmailHelper.sendEmail(
    //   //@ts-ignore
    //   createdOrder.user.email,
    //   emailContent,
    //   "Order confirmed!",
    //   attachment
    // );
    return result;
  } catch (error) {
    console.log(error);
    // Rollback the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getOrderDetails = async (orderId: string) => {
  const order = await Order.findById(orderId).populate(
    "user properties.property coupon"
  );
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, "Order not Found");
  }

  order.payment = await Payment.findOne({ order: order._id });
  return order;
};

const getMyOrders = async (
  query: Record<string, unknown>,
  authUser: IJwtPayload
) => {
  const orderQuery = new QueryBuilder(
    Order.find({ user: authUser.userId }).populate(
      "user properties.property coupon"
    ),
    query
  )
    .search(["user.name", "user.email", "properties.property.name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;

  const meta = await orderQuery.countTotal();

  return {
    meta,
    result,
  };
};

const changeOrderStatus = async (
  orderId: string,
  status: string,
  authUser: IJwtPayload
) => {
  const order = await Order.findOneAndUpdate(
    { _id: new Types.ObjectId(orderId) },
    { status },
    { new: true }
  );
  return order;
};

export const OrderService = {
  createOrder,

  getOrderDetails,
  getMyOrders,
  changeOrderStatus,
};
