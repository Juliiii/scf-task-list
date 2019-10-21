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
  const { taskId } = ctx.request.body;
  const { user } = ctx.session;

  const connection = await database().connection();
  const result = await connection.queryAsync(
    "select * from tasks where user = ? and id = ?",
    [user, taskId]
  );

  if (result.length === 0) {
    throw {
      status: 400,
      message: "任务不存在"
    };
  }

  await connection.queryAsync("delete from tasks where user = ? and id = ?", [
    user,
    taskId
  ]);

  return "删除成功";
});

exports.main_handler = serverless(app);
