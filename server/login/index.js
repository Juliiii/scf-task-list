"use strict";

const serverless = require("serverless-http");
const Koa = require("koa"); // or any supported framework
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
    ctx.body = result;
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message || JSON.stringify(err);
  }
});

app.use(async ctx => {
  const { user, password } = ctx.request.body;

  if (ctx.session.user) {
    throw {
      status: 400,
      message: "用户已登录"
    };
  }

  if (!ctx.session.user) {
    const connection = await database().connection();
    const result = await connection.queryAsync(
      "select user, password from users where user = ?",
      [user]
    );

    if (result.length === 0) {
      throw {
        status: 400,
        message: "用户不存在"
      };
    }

    if (result[0].password !== password) {
      throw {
        status: 400,
        message: "密码错误"
      };
    }

    ctx.session = {
      user
    };
  }

  return "登录成功";
});

exports.main_handler = serverless(app);
