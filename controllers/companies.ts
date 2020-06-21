// import { ICompany, Company } from "../models/Company.ts";
import { ICompany, Company } from "../models/Company.ts";
import { helpers } from "https://deno.land/x/oak/mod.ts";

const companyModel = new Company();

export class CompanyController {
  // @desc Get All Companys
  // @ route GET /api/v1/companies
  getCompanies = async (ctx: any) => {
    // let queryParams = helpers.getQuery(ctx);
    let results = await companyModel.getCompanies(ctx);

    ctx.response.status = results.status;
    ctx.response.body = results.body;
  };
  // @desc Get All Companys
  // @ route GET /api/v1/companies
  getCompaniesWithJobs = async (ctx: any) => {
    // let queryParams = helpers.getQuery(ctx);
    let results = await companyModel.getCompaniesWithJobs(ctx);
    
    ctx.response.status = results.status;
    ctx.response.body = results.body;
  };

  // @desc Get Single Companys
  // @ route GET /api/v1/companies/:id

  getCompany = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await companyModel.getCompany(params.id);
    response.status = results.status;
    response.body = results.body;
  };
  // @desc Get Single Companys
  // @ route GET /api/v1/companies/:id

  getCompanyWithDetails = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await companyModel.getCompanyWithDetails(params.id);
    response.status = results.status;
    response.body = results.body;
  };

  // @desc Add Companys
  // @ route POST /api/v1/companies
  addCompany = async ({
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
      if (await companyModel.validate(body.value)) {
        const { name, user_id, ...values } = body.value;

        let company: ICompany = {
          name,
          user_id,
        };

        company = { ...company, ...values };

        console.log(company);
        const companyExists = await companyModel.getCompanyByValue(
          "name",
          name
        );

        if (companyExists.body.success === true) {
          response.status = 404;
          response.body = {
            success: false,
            msg: `Company with name: ${name} already exists`,
          };
        } else {
          let result = await companyModel.addCompany(company);
          response.status = result.status;
          response.body = result.body;
        }
      } else {
        response.status = 404;
        response.body = {
          success: false,
          msg: "Please enter all required values",
        };
      }
    }
  };

  // @desc update Companys
  // @ route PUT /api/v1/companies/:id

  updateCompany = async ({
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
      let result = await companyModel.updateCompany(body.value, params.id);
      response.status = result.status;
      response.body = result.body;
    }
  };

  // @desc Delete Company
  // @ route DELETE  /api/v1/companies/:id

  deleteCompany = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await companyModel.deleteCompany(params.id);
    response.status = results.status;
    response.body = results.body;
  };
}
