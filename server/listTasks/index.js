"use strict";

const serverless = require("serverless-http");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const database = require("scf-nodejs-serverlessdb-sdk").database;
const session = require("koa-session2");
const Store = require("./Store");
const cors = require("koa2-cors");

const app = new Koa();
app.use(cors());

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

exports.main_handler = serverless(app);
