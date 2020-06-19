import { Router } from "https://deno.land/x/oak/mod.ts";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.ts";

import { UserController } from "../controllers/users.ts";
import { CompanyController } from "../controllers/companies.ts";
import { protect, authorize } from "../middleware/auth.ts";

const userController = new UserController();
const companyController = new CompanyController();

import { register, login, me } from "../controllers/auth.ts";
const router = new Router();

router
  .get("/api/v1/products", getProducts)
  .get("/api/v1/products/:id", getProduct)
  .post("/api/v1/products", addProduct)
  .put("/api/v1/products/:id", updateProduct)
  .delete("/api/v1/products/:id", deleteProduct);

router
  .get("/api/v1/users", protect, authorize("admin"), userController.getUsers)
  .get("/api/v1/users/:id", protect, authorize("admin"), userController.getUser)
  .post("/api/v1/users", protect, authorize("admin"), userController.addUser)
  .put(
    "/api/v1/users/:id",
    protect,
    authorize("admin"),
    userController.updateUser
  )
  .delete(
    "/api/v1/users/:id",
    protect,
    authorize("admin"),
    userController.deleteUser
  );

router
  .get(
    "/api/v1/companies",
    protect,
    authorize("admin", "company"),
    companyController.getCompanies
  )
  .get(
    "/api/v1/companies/:id",
    protect,
    authorize("admin", "company"),
    companyController.getCompany
  )
  .post(
    "/api/v1/companies",
    protect,
    authorize("admin", "company"),
    companyController.addCompany
  )
  .put(
    "/api/v1/companies/:id",
    protect,
    authorize("admin", "company"),
    companyController.updateCompany
  )
  .delete(
    "/api/v1/companies/:id",
    protect,
    authorize("admin", "company"),
    companyController.deleteCompany
  );

router
  .post("/api/v1/auth/register", register)
  .post("/api/v1/auth/login", login)
  .get("/api/v1/auth/me", protect, me);

export default router;
