# 腾讯大学直播课程代码

## 简介

前端react + 后端serverless 实现的任务清单网页

## Live Demo

[live demo](https://scftask-1253970226.cos-website.ap-guangzhou.myqcloud.com/login)

## Frontend

### How to run

```bash
npm start # for dev

npm build # for deploy

```

### How to deploy

本人部署到了腾讯云COS，其余部署方式都可以。

## Backend

### What?

serverless

one api, one function

使用腾讯云云函数

### How to run?

+ 本地调试，需要搭建好redis和mysql环境，使用腾讯云scf vscode插件可以本地模拟请求参数来断点调试。

+ 远端调试，需要购买好云端的mysql和redis，使用腾讯云scf vscode插件或者scf cli部署到腾讯云后，使用web或者postman可以进行调试

### How to deploy?

使用腾讯云提供的开发者工具可以方便本地部署

scf cli使用文档：[https://cloud.tencent.com/document/product/583/33445](https://cloud.tencent.com/document/product/583/33445)<br/>

vscode插件使用文档：[https://cloud.tencent.com/document/product/583/38106](https://cloud.tencent.com/document/product/583/38106)
