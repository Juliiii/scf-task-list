"use strict";

const serverless = require("serverless-http");
const Koa = require("koa"); // or any supported framework
const bodyParser = require("koa-bodyparser");
const database = require("scf-nodejs-serverlessdb-sdk").database;
const Joi = require("joi");

const userSchema = Joi.object({
  user: Joi.string()
    .min(4)
    .max(50)
    .required(),
  password: Joi.string()
    .min(4)
    .max(50)
    .required()
});

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

  const validateOutput = userSchema.validate({ user, password });

  if (validateOutput.error) {
    throw {
      status: 400,
      message: validateOutput.error
    };
  }

  const connection = await database().connection();
  const result = await connection.queryAsync(
    "select user, password from users where user = ?",
    [user]
  );

  if (result.length !== 0) {
    throw {
      status: 400,
      message: "用户已存在"
    };
  }

  await connection.queryAsync("insert users (user, password) values (?, ?)", [
    user,
    password
  ]);

  return "注册成功";
});

exports.main_handler = serverless(app);
