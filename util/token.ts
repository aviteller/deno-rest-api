import {
  validateJwt,
  parseAndDecode,
  validateJwtObject,
} from "https://deno.land/x/djwt/validate.ts";
import {
  makeJwt,
  setExpiration,
  Jose,
  Payload,
} from "https://deno.land/x/djwt/create.ts";

import { IUser } from "../models/User.ts";

const JwtConfig = {
  header: "Authorization",
  schema: "Bearer",
  // use Env variable
  secretKey: Deno.env.get("JWT_SECRET") || "",
  expirationTime: 60000,
  type: "JWT",
  alg: "HS256",
};

const createToken = (user: IUser): string => {
  const payload: Payload = {
    id: user.id,
    name: user.name,
    role: user.role,
    exp: setExpiration(new Date().getTime() + JwtConfig.expirationTime * 60),
  };

  const header: any = { type: JwtConfig.type, alg: JwtConfig.alg };
  return makeJwt({ header, payload, key: JwtConfig.secretKey });
};

const validateToken = async (token: string) => {
  return await validateJwt(token, JwtConfig.secretKey);
};

const fetchUserByToken = async (token: string) =>
  await validateJwtObject(parseAndDecode(token)).payload;

export { createToken, validateToken, fetchUserByToken, JwtConfig };
