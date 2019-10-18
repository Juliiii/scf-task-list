"use strict";

const serverless = require("serverless-http");
const Koa = require("koa"); // or any supported framework
const bodyParser = require("koa-bodyparser");
const database = require("scf-nodejs-serverlessdb-sdk").database;
const session = require("koa-session2");
const Store = require("./Store");

const app = new Koa();

if (process.env.NODE_ENV !== "production") {
  process.env["DB_DEFAULT"] = "DB1";

  process.env["DB_DB1_DATABASE"] = "scf_operator";

  process.env["DB_DB1_PASSWORD"] = "Fighting4862-";

  process.env["DB_DB1_PORT"] = 3306;

  process.env["DB_DB1_USER"] = "root";

  process.env["DB_DB1_HOST"] = "localhost";

  process.env["REDIS_HOST"] = "localhost";

  process.env["REDIS_PORT"] = 6379;
}

app.use(bodyParser());

app.use(
  session({
    store: new Store(),
    key: "SESSIONID", // default "koa:sess"
    maxAge: 60 * 1000 * 1000
  })
);

app.use(async (ctx, next) => {
  try {
    const result = await next();
    ctx.body = JSON.stringify(result);
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message || JSON.stringify(err);
  }
});

app.use(async (ctx, next) => {
  if (ctx.session.user) {
    return await next();
  } else {
    throw {
      status: 401,
      message: "您还未登录，请先登录"
    };
  }
});

app.use(async ctx => {
  let { limit = 10, offset = 0, status = 1 } = ctx.request.body;
  const { user } = ctx.session;

  limit = +limit;
  offset = +offset;

  const connection = await database().connection();

  const totalList = await connection.queryAsync(
    "select * from tasks where user = ? and status = ?",
    [user, +status]
  );

  return {
    list: totalList.slice(offset * limit, (offset + 1) * limit),
    totalCount: totalList.length
  };
});

const handler = serverless(app);

exports.main_handler = async (event, context, callback) => {
  const result = await handler(event, context);

  return result;
};
