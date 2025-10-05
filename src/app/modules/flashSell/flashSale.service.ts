import QueryBuilder from "../../builder/QueryBuilder";
import { IJwtPayload } from "../auth/auth.interface";
import { ICreateFlashSaleInput } from "./flashSale.interface";
import { FlashSale } from "./flashSale.model";

const createFlashSale = async (
  flashSellData: ICreateFlashSaleInput,
  authUser: IJwtPayload
) => {
  const { properties, discountPercentage } = flashSellData;
  const createdBy = authUser.userId;

  const operations = properties.map((property) => ({
    updateOne: {
      filter: { property },
      update: {
        $setOnInsert: {
          property,
          discountPercentage,
          createdBy,
        },
      },
      upsert: true,
    },
  }));

  const result = await FlashSale.bulkWrite(operations);
  return result;
};

const getActiveFlashSalesService = async (query: Record<string, unknown>) => {
  const { minPrice, maxPrice, ...pQuery } = query;

  const flashSaleQuery = new QueryBuilder(
    FlashSale.find().populate("property").populate("property.category", "name"),
    query
  ).paginate();

  const flashSales = await flashSaleQuery.modelQuery.lean();

  const flashSaleMap = flashSales.reduce((acc, flashSale) => {
    //@ts-ignore
    acc[flashSale.property._id.toString()] = flashSale.discountPercentage;
    return acc;
  }, {});

  const propertiesWithOfferPrice = flashSales.map((flashSale: any) => {
    const property = flashSale.property;
    //@ts-ignore
    const discountPercentage = flashSaleMap[property._id.toString()];

    if (discountPercentage) {
      const discount = (discountPercentage / 100) * property.price;
      property.offerPrice = property.price - discount;
    } else {
      property.offerPrice = null;
    }

    return property;
  });

  const meta = await flashSaleQuery.countTotal();

  return {
    meta,
    result: propertiesWithOfferPrice,
  };
};

export const FlashSaleService = {
  createFlashSale,
  getActiveFlashSalesService,
};
