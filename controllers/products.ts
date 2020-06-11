import { ProductModel } from "../models/products.ts";
import { helpers } from "https://deno.land/x/oak/mod.ts";

const productModel = new ProductModel();
// import { getAll, getOne, deleteOne, addOne, updateOne } from "../helpers/DB.ts";

// @desc Get All Products
// @ route GET /api/v1/products

const getProducts = async (ctx: any) => {
  let queryParams = helpers.getQuery(ctx);
  let results = await productModel.getProducts(queryParams);
  ctx.response.status = results.status;
  ctx.response.body = results.body;
};

// @desc Get Single Products
// @ route GET /api/v1/products/:id

const getProduct = async ({
  params,
  response,
}: {
  params: { id: string };
  response: any;
}) => {
  let results = await productModel.getProduct(params.id);
  response.status = results.status;
  response.body = results.body;
};

// @desc Add Products
// @ route POST /api/v1/products

const addProduct = async ({
  request,
  response,
}: {
  request: any;
  response: any;
}) => {
  // console.log(body.value);
  const body = await request.body();
  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "No data found",
    };
  } else {
    let result = await productModel.addProduct(body.value);
    response.status = result.status;
    response.body = result.body;
  }
};

// @desc update Products
// @ route PUT /api/v1/products/:id

const updateProduct = async ({
  params,
  request,
  response,
}: {
  params: { id: string };
  request: any;
  response: any;
}) => {
  const body = await request.body();
  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "No data found",
    };
  } else {
    let result = await productModel.updateProduct(body.value, params.id);
    response.status = result.status;
    response.body = result.body;
  }
};

// @desc Delete Product
// @ route DELETE  /api/v1/products/:id

const deleteProduct = async ({
  params,
  response,
}: {
  params: { id: string };
  response: any;
}) => {
  let results = await productModel.deleteProduct(params.id);
  response.status = results.status;
  response.body = results.body;
};

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct };
