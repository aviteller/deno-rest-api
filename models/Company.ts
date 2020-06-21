import { DB } from "../helpers/DB.ts";
import { Job } from "./Job.ts";
const jobModel = new Job();

export interface ICompany {
  id?: string;
  user_id: number;
  name: string;
  slug?: string;
  description?: string;
  contact?: {
    website?: string;
    email?: string;
    phone?: string;
  };
  location?: {
    number?: string;
    street?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  size?: number;
  rating?: number;
  photo?: string;
}

export class Company extends DB {
  table = "companies";

  belongsTo = {
    selector: "user_id",
    alias: "u",
    table: "users",
    fields: "id,name",
  };

  hasMany = {
    table: "jobs",
    alias: "j",
    selector: "company_id",
  };
  //make function in higher class
  validate(values: any) {
    if ("name" in values) {
      return true;
    } else {
      return false;
    }
  }

  async getCompanyWithDetails(id: any) {
    const returnCompany = await this.getOne(id);

    const jobs = await jobModel.getJobsByCompanyID(id);
    const returnObj = {
      status: 200,
      body: {
        success: true,
        data: { company: returnCompany.body.data, jobs: jobs.body.data.rows },
      },
    };

    return returnObj;
  }
  async getCompany(id: any) {
    const returnCompany = await this.getOne(id);

    return returnCompany;
  }

  async getCompanyByValue(field: string, value: any) {
    return await this.getOneByValue(field, value);
  }

  async getCompanies(queryParams: any) {
    return await this.getAll(queryParams, true);
  }
  async getCompaniesWithChildren(queryParams: any) {
    let companies = await this.getAll(queryParams, true);

    companies = await companies.body.data.rows;

    for await (const company of companies) {
      let jobs = await jobModel.getJobsByCompanyID(company.id.toString());
      company.jobs = jobs.rows;
    }

    // await companies.forEach(async (company: any) => {

    //   let jobs = await jobModel.getJobsByCompanyID(company.id.toString());

    //   // if (jobs.body.data.rows && jobs.body.data.rows > 0)
    //   //   company.jobs = jobs.body.data.rows;
    // });
    return {
      status: 200,
      body: { success: true, data: companies },
    };
  }

  async addCompany(values: any) {
    return await this.addOne(values);
  }

  async updateCompany(values: any, id: any) {
    return await this.updateOne(values, id);
  }

  async deleteCompany(id: any) {
    return await this.deleteOne(id);
  }
}
