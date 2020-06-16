import { Client } from "https://deno.land/x/postgres/mod.ts";
import { dbCreds } from "../config.ts";

//init client
const client = new Client(dbCreds);

class DB {
  table?: string;

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

  totalRows = async (serachStr: string, deleted?: boolean) => {
    let returnNo: number = 0;

    const { rows } = await client.query(
      `SELECT COUNT(*) FROM ${this.table}
       WHERE 
          CASE WHEN ${deleted} THEN
               deleted_at is not null ${serachStr.replace("OR", "AND")}
               ELSE
               deleted_at is null ${serachStr}
          END`
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

  getDeleted = (queryParams: any): boolean => {
    let { deleted } = queryParams;
    if (deleted !== undefined) return true;
    else return false;
  };

  getPageAndLimit = (
    queryParams: any
  ): {
    page: number;
    limit: any;
    endIndex: number;
    pageStr: string;
  } => {
    let { page, limit } = queryParams;
    const returnObj: any = new Object();
    const startPage: number = page !== undefined ? page : 1;
    const pageLimit: number = limit !== undefined ? limit : 10;

    // const startIndex = (startPage - 1) * pageLimit;
    // const endIndex = startPage * pageLimit;
    let startIndex = (startPage - 1) * pageLimit;
    returnObj.endIndex = startPage * pageLimit;
    returnObj.page = startPage;
    returnObj.limit = pageLimit;
    if (limit !== "max") {
      returnObj.pageStr = `LIMIT ${pageLimit} OFFSET ${startIndex}`;
    } else {
      returnObj.pageStr = `LIMIT 500`;
    }

    return returnObj;
  };

  getAll = async (queryParams?: any) => {
    let response: any = new Object();

    let { select } = queryParams;

    try {
      await client.connect();

      const orderBy: string = await this.sortBy(queryParams);

      const searchByString: string = await this.searchBy(queryParams);

      const selectFields: string = select === undefined ? "*" : select;

      const deleted = (await this.getDeleted(queryParams)) ? "is not" : "is";

      const pageAndLimitObject = await this.getPageAndLimit(queryParams);

      const finalQuery = `SELECT ${selectFields} FROM ${this.table} WHERE deleted_at ${deleted} null ${searchByString} ${orderBy} ${pageAndLimitObject.pageStr}`;

      const result = await client.query(finalQuery);

      const resObj: any = new Object();

      const resultsArray: Array<Object> = new Array();

      result.rows.map((p) => {
        let obj: any = new Object();
        result.rowDescription.columns.map((el, i) => (obj[el.name] = p[i]));
        resultsArray.push(obj);
      });

      const total = await this.totalRows(
        searchByString,
        await this.getDeleted(queryParams)
      );

      resObj.pagination = await this.pagination(pageAndLimitObject, total);
      resObj.count = result.rowCount;
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

  pagination = (
    pageObj: {
      page: number;
      limit: any;
      endIndex: number;
      pageStr: string;
    },
    total: number
  ): Object => {
    const returnObj: any = new Object();
    if (pageObj.limit !== "max") {
      if (pageObj.page != 1) returnObj.prevPage = pageObj.page - 1;
      returnObj.currentPage = +pageObj.page;
      returnObj.totalPages = Math.ceil(total / pageObj.limit);
      returnObj.totalRows = total;

      if (pageObj.endIndex < total) {
        returnObj.nextPage = +pageObj.page + 1;
      }
    }

    return returnObj;
  };

  getOne = async (id: string) => {
    let response: any = new Object();
    try {
      await client.connect();

      const result = await client.query(
        `SELECT * FROM ${this.table} WHERE id = $1`,
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

  getOneByValue = async (field: string, value: string) => {
    let response: any = new Object();
    try {
      await client.connect();

      const result = await client.query(
        `SELECT * FROM ${this.table} WHERE ${field} = $1 AND deleted_at is null`,
        value
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

  customQuery = async (query: string) => {
    let response: any = new Object();
    try {
      await client.connect();

      const result = await client.query(query);

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

  updateOne = async (values: any, id: string) => {
    let response: any = new Object();
    let res = await this.getOne(id);
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

      const updatedQuery = `UPDATE ${this.table} SET ${updatedColumns.join(
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

  addOne = async (values: any) => {
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

    const insertQuery = `INSERT INTO ${this.table}(${insertColumns.join(
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

  deleteOne = async (id: string) => {
    let response: any = new Object();
    let res = await this.getOne(id);
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
            `UPDATE ${this.table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
            id
          );
        } else {
          await client.query(`DELETE FROM ${this.table} WHERE id = $1`, id);
        }

        response.status = 200;
        response.body = {
          success: true,
          msg: `${this.table} with id ${id} Removed`,
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
