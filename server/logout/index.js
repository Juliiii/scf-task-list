"use strict";

const serverless = require("serverless-http");
const Koa = require("koa"); // or any supported framework
const bodyParser = require("koa-bodyparser");
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
    ctx.body = result;
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message || JSON.stringify(err);
  }
});

app.use(async ctx => {
  delete ctx.session.user;
  return "退出成功";
});

exports.main_handler = serverless(app);
