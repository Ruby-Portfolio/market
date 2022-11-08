import { Product } from './product.schema';
import { Types } from 'mongoose';
import { Country } from '../common/enums/Country';
import { localDateTimeToString } from '../../common/util/dateUtil';

export class ProductResponse {
  constructor(product: Product & { _id: Types.ObjectId }) {
    const market: any = product.market;
    this.product = {
      ...market,
      deadline: localDateTimeToString(product.deadline),
      market: { ...market },
    };
  }

  product: {
    id: Types.ObjectId;
    name: string;
    price: number;
    country: Country;
    deadline: string;
    market: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export class ProductsResponse {
  constructor(products: (Product & { _id: Types.ObjectId })[]) {
    this.products = products?.map((product) => {
      return {
        id: product._id,
        name: product.name,
        price: product.price,
        country: product.country,
      };
    });
  }

  products: {
    id: Types.ObjectId;
    name: string;
    price: number;
    country: Country;
  }[];
}
