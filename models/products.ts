import { DB } from "../helpers/DB.ts";

// export interface IProduct {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
// }

export class ProductModel extends DB {
  id?: string;
  name?: string;
  description?: string;
  price?: number;

  super(id?: string, name?: string, description?: string, price?: number) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
  }
//make function in higher class
  validate(values: any) {
    if ("name" in values && "price" in values && "description" in values) {
      return true;
    } else {
      return false;
    }
  }

  async getProduct(id: any) {
    return await this.getOne( id);
  }

  async getProducts(queryParams: any) {
    return await this.getAll(queryParams);
  }

  async addProduct(values: any) {
    // let validated = await this.validate(values);
    if (this.validate(values)) {
      return await this.addOne(values);
    } else {
      let response: any = new Object();
      response.status = 404;
      response.body = {
        success: false,
        msg: "No data found",
      };
      return response;
    }
  }

  async updateProduct(values: any, id: any) {
    return await this.updateOne(values, id);
  }

  async deleteProduct(id: any) {
    return await this.deleteOne(id);
  }
}
