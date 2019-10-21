"use strict";

const serverless = require("serverless-http");
const Koa = require("koa"); // or any supported framework
const bodyParser = require("koa-bodyparser");
const database = require("scf-nodejs-serverlessdb-sdk").database;
const Joi = require("joi");
const session = require("koa-session2");
const Store = require("./Store");
const cors = require("koa2-cors");

const taskSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .required(),
  status: Joi.number()
    .integer()
    .min(0)
    .max(1)
    .required(),
  taskId: Joi.number()
    .integer()
    .required()
});

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
  const { title, status, taskId } = ctx.request.body;
  const { user } = ctx.session;

  const validateOutput = taskSchema.validate({ title, status, taskId });

  if (validateOutput.error) {
    throw {
      status: 400,
      message: validateOutput.error
    };
  }

  const connection = await database().connection();

  await connection.queryAsync(
    "update tasks set status = ? , title = ? where user = ? and id = ?",
    [+status, title, user, taskId]
  );

  return "更新任务成功";
});

exports.main_handler = serverless(app);
