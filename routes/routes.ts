import { Router } from "https://deno.land/x/oak/mod.ts";

import { UserController } from "../controllers/users.ts";
import { CompanyController } from "../controllers/companies.ts";
import { JobController } from "../controllers/jobs.ts";
import { protect, authorize } from "../middleware/auth.ts";
import { register, login, me } from "../controllers/auth.ts";

const userController = new UserController();
const companyController = new CompanyController();
const jobController = new JobController();

const router = new Router();

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
    // protect,
    // authorize("admin", "company"),
    companyController.getCompanies
  )
  .get(
    "/api/v1/companies/:id",
    // protect,
    // authorize("admin", "company"),
    companyController.getCompanyWithDetails
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
  .get(
    "/api/v1/jobs",
    // protect,
    // authorize("admin", "company"),
    jobController.getJobs
  )
  .get(
    "/api/v1/jobs/:id",
    // protect,
    // authorize("admin", "company"),
    jobController.getJob
  )
  .post(
    "/api/v1/jobs",
    // protect,
    // authorize("admin", "company"),
    jobController.addJob
  )
  .put(
    "/api/v1/jobs/:id",
    protect,
    authorize("admin", "company"),
    jobController.updateJob
  )
  .delete(
    "/api/v1/jobs/:id",
    protect,
    authorize("admin", "company"),
    jobController.deleteJob
  );

router
  .post("/api/v1/auth/register", register)
  .post("/api/v1/auth/login", login)
  .get("/api/v1/auth/me", protect, me);

export default router;
