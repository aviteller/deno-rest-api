import { Application, isHttpError } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import router from "./routes/routes.ts";
const port = Deno.env.get("PORT") || 5000;
const app = new Application();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      switch (err.status) {
        case 404:
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            msg: "Resource could not be found",
          };
          break;

        default:
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            msg: "Resource could not be proccessed",
          };
          break;
      }
    } else {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        msg: err.toString(),
      };
    }
  }
});

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

console.info(`Server running on port: ${port}`);

await app.listen({ port: +port });
