"use strict";
const serverless = require("serverless-http");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const database = require("scf-nodejs-serverlessdb-sdk").database;
const Joi = require("joi");
const session = require("koa-session2");
const Store = require("./Store");

const taskSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .required(),
  status: Joi.number()
    .integer()
    .min(0)
    .max(1)
    .required()
});

const app = new Koa();

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
  const { title, status } = ctx.request.body;
  const { user } = ctx.session;

  const validateOutput = taskSchema.validate({ title, status });

  if (validateOutput.error) {
    throw {
      status: 400,
      message: validateOutput.error
    };
  }

  const connection = await database().connection();

  await connection.queryAsync(
    "insert into tasks (title, status, user) values (?, ?, ?)",
    [title, status, user]
  );

  return "新增任务成功";
});

exports.main_handler = serverless(app);
