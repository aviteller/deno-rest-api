import { Router } from "https://deno.land/x/oak/mod.ts";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.ts";

import { UserController } from "../controllers/users.ts";

import { validJwt } from "../middleware/jwt.ts";
const userController = new UserController();

import { register, login } from "../controllers/auth.ts";
const router = new Router();

router
  .get("/api/v1/products", getProducts)
  .get("/api/v1/products/:id", getProduct)
  .post("/api/v1/products", addProduct)
  .put("/api/v1/products/:id", updateProduct)
  .delete("/api/v1/products/:id", deleteProduct);

router
  .get("/api/v1/users", validJwt, userController.getUsers)
  .get("/api/v1/users/:id", userController.getUser)
  .post("/api/v1/users", userController.addUser)
  .put("/api/v1/users/:id", userController.updateUser)
  .delete("/api/v1/users/:id", userController.deleteUser);

router
  .post("/api/v1/auth/register", register)
  .post("/api/v1/auth/login", login);

export default router;
