
import { Client } from "https://deno.land/x/postgres/mod.ts";
import { User } from "../models/users.ts";
import { dbCreds } from "../config.ts";

//init client
const client = new Client(dbCreds);


// @desc Get All Users
// @ route GET /api/v1/users

const getUsers = async ({ response }: { response: any }) => {
  try {
    await client.connect();

    const result = await client.query("SELECT * FROM users");

    const users = new Array();

    result.rows.map((p) => {
      let obj: any = new Object();

      result.rowDescription.columns.map((el, i) => (obj[el.name] = p[i]));

      users.push(obj);
    });

    response.body = {
      success: true,
      data: users,
    };
  } catch (error) {
    response.status = 500;
    response.body = {
      success: false,
      msg: error.toString(),
    };
  } finally {
    await client.end();
  }
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
  try {
    await client.connect();

    const result = await client.query(
      "SELECT * FROM products WHERE id = $1",
      params.id
    );

    if (result.rows.toString() === "") {
      response.status = 404;
      response.body = {
        success: false,
        msg: "No data found",
      };
      return;
    } else {
      const product: Product | any = new Object();
      result.rows.map((p) =>
        result.rowDescription.columns.map((el, i) => (product[el.name] = p[i]))
      );

      response.body = {
        success: true,
        data: product,
      };
    }

    // const products = new Array();

    // result.rows.map((p) => {
    //   let obj: any = new Object();

    //   result.rowDescription.columns.map((el, i) => (obj[el.name] = p[i]));

    //   products.push(obj);
    // });
  } catch (error) {
    response.status = 500;
    response.body = {
      success: false,
      msg: error.toString(),
    };
  } finally {
    await client.end();
  }
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
  const body = await request.body();

  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "No data found",
    };
  } else {
    try {
      await client.connect();
      const product: Product = body.value;
      const result = await client.query(
        `INSERT INTO products(name,description,price) VALUES($1,$2,$3)`,
        product.name,
        product.description,
        product.price
      );
      // product.id = v4.generate();
      // products.push(product);

      response.status = 201;
      response.body = {
        success: true,
        data: product,
      };
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
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
  await getProduct({ params: { id: params.id }, response });
  if (response.status === 404) {
    response.status = 404;
    response.body = {
      success: false,
      msg: response.body.msg,
    };
    return;
  } else {
    const body = await request.body();
    const updateData: { name?: string; description?: string; price?: number } =
      body.value;

    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "No data found",
      };
    } else {
      try {
        await client.connect();
        const product: Product = body.value;
        const result = await client.query(
          `UPDATE products SET name=$1, description=$2, price=$3 WHERE id = $4`,
          product.name,
          product.description,
          product.price,
          params.id
        );

        response.status = 201;
        response.body = {
          success: true,
          data: product,
        };
      } catch (error) {
        response.status = 500;
        response.body = {
          success: false,
          msg: error.toString(),
        };
      } finally {
        await client.end();
      }
    }
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
  await getProduct({ params: { id: params.id }, response });
  if (response.status === 404) {
    response.status = 404;
    response.body = {
      success: false,
      msg: response.body.msg,
    };
    return;
  } else {
    try {
      await client.connect();

      const result = await client.query(
        `DELETE FROM products WHERE id = $1`,
        params.id
      );
      // product.id = v4.generate();
      // products.push(product);

      response.status = 200;
      response.body = {
        success: true,
        msg: `Product Removed`,
      };
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
  }
};

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct };
