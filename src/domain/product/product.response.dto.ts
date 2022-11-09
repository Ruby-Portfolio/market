import { Product } from './product.schema';
import { Types } from 'mongoose';
import { Country } from '../common/enums/Country';
import { localDateTimeToString } from '../../common/util/dateUtil';

export class ProductResponse {
  constructor(product: Product & { _id: Types.ObjectId }) {
    if (product) {
      const market: any = product.market;
      this.product = {
        id: product._id,
        name: product.name,
        price: product.price,
        country: product.country,
        deadline: localDateTimeToString(product.deadline),
        market: {
          id: market._id,
          name: market.name,
          email: market.email,
          phone: market.phone,
        },
      };
    }
  }

  product: {
    id: Types.ObjectId;
    name: string;
    price: number;
    country: Country;
    deadline: string;
    market: {
      id: string;
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
