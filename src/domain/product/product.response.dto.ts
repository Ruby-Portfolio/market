import { Product } from './product.schema';
import { Types } from 'mongoose';
import { Country } from '../common/enums/Country';

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
