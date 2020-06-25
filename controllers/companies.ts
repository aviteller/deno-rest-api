// import { ICompany, Company } from "../models/Company.ts";
import { ICompany, Company } from "../models/Company.ts";
import { ErrorResponse } from "../util/errorResponse.ts";
import { makeResponse } from "../util/response.ts";
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
  getCompaniesWithJobs = async (ctx:any) => {
    // let queryParams = helpers.getQuery(ctx);


    

    let results = await companyModel.getCompaniesWithJobs(ctx);
    ctx.response = makeResponse(ctx, 200, true, results);
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

  getCompanyWithDetails = async (ctx: any) => {
    let results = await companyModel.getCompanyWithDetails(ctx.params.id);

    ctx.response = makeResponse(ctx, 200, true, results);
  };

  // @desc Add Companys
  // @ route POST /api/v1/companies
  addCompany = async (ctx:any) => {
    // console.log(body.value);
    const body = await ctx.request.body();
    if (!ctx.request.hasBody) {
      throw new ErrorResponse("No data found", 400)
    } else {
      if (await companyModel.validate(body.value)) {
        const { name, user_id, ...values } = body.value;

        let company: ICompany = {
          name,
          user_id,
        };
// console.log(company)
        company = { ...company, ...values };

   
        const companyExists = await companyModel.getCompanyByValue(
          "name",
          name
        );
        console.log(companyExists)
        if (companyExists !== false) {
          throw new ErrorResponse(`Company with name: ${name} already exists`, 404)
        } else {
          let result = await companyModel.addCompany(company);
          ctx.response = makeResponse(ctx, 201, true, result);
        }
      } else {
        throw new ErrorResponse("Please enter all required values", 404)
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
      throw new ErrorResponse("No data found", 400)
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
