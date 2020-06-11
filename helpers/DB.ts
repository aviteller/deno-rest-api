import { Client } from "https://deno.land/x/postgres/mod.ts";
import { dbCreds } from "../config.ts";

//init client
const client = new Client(dbCreds);

class DB {
  getAll = async (model: any, queryParams?: any) => {
    let response: any = new Object();

    let { page, limit, sort, select, search } = queryParams;

    try {
      await client.connect();

      let startPage: number = 1;
      let pageLimit: number = 10;
      let sortBy: string = "id";
      let selectFields: string = "*";
      let orderBy: string = "";
      let searchBy: string = "";
      let searchByString: string = "";
      let limitQuery = "";

      if (page !== undefined) startPage = page;
      if (limit !== undefined) pageLimit = limit;
      if (sort !== undefined) sortBy = sort;
      if (select !== undefined) selectFields = select;
      if (search !== undefined) searchBy = search;

      if (searchBy !== "") {
        searchByString = "WHERE ";
  
        let searchParams = searchBy.split("|");
        let searchFields = searchParams[1].split(",");
        let searchValue = searchParams[0];
        let arrLen = searchFields.length;

        searchFields.forEach((s, i) => {
          searchByString += ` CAST(${s} as TEXT) ILIKE '%${searchValue}%' `;
          if (i+1 < arrLen) searchByString += " OR ";
        });
      }

      if (sortBy.charAt(0) === "-") {
        orderBy = ` ORDER BY ${sortBy.substring(1)} DESC`;
      } else {
        orderBy = ` ORDER BY ${sortBy} ASC`;
      }

      const offset = (startPage - 1) * pageLimit;
      const endIndex = startPage * pageLimit;

      if (limit !== "all") {
        limitQuery = `LIMIT ${pageLimit} OFFSET ${offset}`;
      } else {
        limitQuery = `LIMIT 500`;
      }

      const finalQuery = `SELECT ${selectFields} FROM ${model}s ${searchByString} ${orderBy} ${limitQuery}`;

      const result = await client.query(finalQuery);

      const resObj: any = new Object();
      let resultsArray: any = new Array();

      result.rows.map((p) => {
        let obj: any = new Object();

        result.rowDescription.columns.map((el, i) => (obj[el.name] = p[i]));
        resultsArray.push(obj);
      });

      resObj.count = result.rowCount;
      if (limit !== "all") {
        const { rows } = await client.query(
          `SELECT COUNT(*) FROM ${model}s ${searchByString}`
        );
        let total = +rows;
        if (startPage != 1) resObj.prevPage = startPage - 1;
        resObj.currentPage = +startPage;
        resObj.totalPages = Math.ceil(total / pageLimit);
        resObj.totalRows = total;

        if (endIndex < total) {
          resObj.nextPage = +startPage + 1;
        }
      }
      resObj.rows = resultsArray;
      response.staus = 200;
      response.body = {
        success: true,
        data: resObj,
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

    return response;
  };

  getOne = async (model: any, id: string) => {
    let response: any = new Object();
    try {
      await client.connect();

      const result = await client.query(
        `SELECT * FROM ${model}s WHERE id = $1`,
        id
      );

      if (result.rows.toString() === "") {
        response.status = 404;
        response.body = {
          success: false,
          msg: "No data found",
        };
        return response;
      } else {
        const resObj: any = new Object();
        result.rows.map((p) =>
          result.rowDescription.columns.map((el, i) => (resObj[el.name] = p[i]))
        );
        response.status = 200;
        response.body = {
          success: true,
          data: resObj,
        };
      }
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }

    return response;
  };

  updateOne = async (model: any, values: any, id: string) => {
    let response: any = new Object();
    let res = await this.getOne(model, id);
    if (res.status === 404) {
      response.status = 404;
      response.body = {
        success: false,
        msg: response.body.msg,
      };
      return response;
    } else {
      const updatedColumns = new Array();
      const updatedValues = new Array();

      let i = 1;
      for (const v in values) {
        updatedColumns.push(`${v}=$${i++}`);
        updatedValues.push(values[v]);
      }

      const updatedQuery = `UPDATE ${model}s SET ${updatedColumns.join(
        ","
      )} WHERE id = ${id} RETURNING *`;

      try {
        await client.connect();

        const result = await client.query(updatedQuery, ...updatedValues);

        const resObj: any = new Object();
        result.rows.map((p) =>
          result.rowDescription.columns.map((el, i) => (resObj[el.name] = p[i]))
        );

        if (result.rows.toString() === "") {
          response.status = 404;
          response.body = {
            success: false,
            msg: "No data found",
          };
          return response;
        } else {
          response.status = 201;
          response.body = {
            success: true,
            data: resObj,
          };
        }
      } catch (error) {
        response.status = 500;
        response.body = {
          success: false,
          msg: error.toString(),
        };
      } finally {
        await client.end();
      }
      return response;
    }
  };

  addOne = async (model: any, values: any) => {
    let response: any = new Object();
    const insertColumns = new Array();
    const insertValues = new Array();
    const insertPlaceholder = new Array();

    let i = 1;
    for (const v in values) {
      insertColumns.push(v);
      insertValues.push(values[v]);
      insertPlaceholder.push(`$${i++}`);
    }

    const insertQuery = `INSERT INTO ${model}s(${insertColumns.join(
      ","
    )}) VALUES(${insertPlaceholder}) RETURNING *`;

    try {
      await client.connect();

      const result = await client.query(insertQuery, ...insertValues);

      const resObj: any = new Object();

      result.rows.map((p) =>
        result.rowDescription.columns.map((el, i) => (resObj[el.name] = p[i]))
      );

      if (result.rows.toString() === "") {
        response.status = 404;
        response.body = {
          success: false,
          msg: "No data found",
        };
        return response;
      } else {
        response.status = 201;
        response.body = {
          success: true,
          data: resObj,
        };
      }
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }

    return response;
  };

  deleteOne = async (model: any, id: string) => {
    let response: any = new Object();
    let res = await this.getOne(model, id);
    if (res.status === 404) {
      response.status = 404;
      response.body = {
        success: false,
        msg: response.body.msg,
      };
      return response;
    } else {
      try {
        await client.connect();

        const result = await client.query(
          `DELETE FROM products WHERE id = $1`,
          id
        );

        response.status = 200;
        response.body = {
          success: true,
          msg: `${model} with id ${id} Removed`,
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
      return response;
    }
  };
}

export { DB };
