import { Context, Status } from "https://deno.land/x/oak/mod.ts";
import "https://deno.land/x/dotenv/load.ts";
import { validateToken, JwtConfig, fetchUserByToken } from "../util/token.ts";

export const validJwt = async (
  ctx: Context<Record<string, any>>,
  next: () => Promise<void>
) => {
  // Get the token from the request
  const token = ctx.request.headers
    .get(JwtConfig.header)
    ?.replace(`${JwtConfig.schema} `, "");

  // reject request if token was not provide
  if (!token) {
    ctx.response.status = Status.Unauthorized;
    ctx.response.body = { success: false, msg: "Unauthorized" };
    return;
  }

  const result = await validateToken(token);

  // check the validity of the token
  if (!result.isValid) {
    ctx.response.status = Status.Unauthorized;
    ctx.response.body = { success: false, msg: "Token Not Valid" };
    return;
  }

  // JWT is correct, so continue and call the private route
  await next();
};
