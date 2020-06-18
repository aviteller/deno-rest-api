import { Application } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import router from "./routes/routes.ts";
const port = Deno.env.get("PORT") || 5000;
const app = new Application();
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

console.info(`Server running on port: ${port}`);

await app.listen({ port: +port });
