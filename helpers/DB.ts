import { Client } from "https://deno.land/x/postgres/mod.ts";
import { dbCreds } from "../config.ts";

//init client
const client = new Client(dbCreds);

class DB {
  sortBy = (queryParams: any): string => {
    let { sort } = queryParams;
    let retrunStr: string = "";
    if (sort !== undefined) {
      if (sort.charAt(0) === "-") {
        retrunStr = ` ORDER BY ${sort.substring(1)} DESC`;
      } else {
        retrunStr = ` ORDER BY ${sort} ASC`;
      }
    } else {
      ` ORDER BY created_at ASC `;
    }
    return retrunStr;
  };

  totalRows = async (model: any, serachStr?: string) => {
    let returnNo: number = 0;

    const { rows } = await client.query(
      `SELECT COUNT(*) FROM ${model}s ${serachStr}`
    );

    returnNo = +rows;

    return returnNo;
  };

  searchBy = (queryParams: any): string => {
    let { search } = queryParams;
    let returnStr: string = "";
    if (search !== undefined) {
      returnStr = " AND ";

      let searchParams = search.split("|");
      let searchFields: Array<string> = searchParams[1].split(",");
      let searchValue = searchParams[0];
      let arrLen = searchFields.length;

      searchFields.forEach((s, i) => {
        returnStr += ` CAST(${s} as TEXT) ILIKE '%${searchValue}%' `;
        if (i + 1 < arrLen) returnStr += " OR ";
      });
    }

    return returnStr;
  };

  getAll = async (model: any, queryParams?: any) => {
    let response: any = new Object();

    let { page, limit, select } = queryParams;

    try {
      await client.connect();

      let startPage: number = 1;
      let pageLimit: number = 10;
      let limitQuery = "";
      let deleted = "is";
      const orderBy: string = await this.sortBy(queryParams);
      const searchByString: string = await this.searchBy(queryParams);
      const selectFields: string = select === undefined ? "*" : select;

      if (page !== undefined) startPage = page;
      if (limit !== undefined) pageLimit = limit;

      const offset = (startPage - 1) * pageLimit;
      const endIndex = startPage * pageLimit;

      if (limit !== "all") {
        limitQuery = `LIMIT ${pageLimit} OFFSET ${offset}`;
      } else {
        limitQuery = `LIMIT 500`;
      }

      const finalQuery = `SELECT ${selectFields} FROM ${model}s WHERE deleted_at ${deleted} null ${searchByString} ${orderBy} ${limitQuery}`;

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
        let total = await this.totalRows(model, searchByString);

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
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id} RETURNING *`;

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
        // check for deleted flag if deleted flag then perma delete
        if (res.body.data.deleted_at == null) {
          await client.query(
            `UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
            id
          );
        } else {
          await client.query(`DELETE FROM products WHERE id = $1`, id);
        }

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
