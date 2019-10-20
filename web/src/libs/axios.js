import axios from "axios";
import { message } from "antd";

message.config({
  top: 100,
  duration: 2,
  maxCount: 1
});

const instance = axios.create({
  baseURL: "https://service-raqe67vw-1252618971.gz.apigw.tencentcs.com/release",
  withCredentials: true
});

instance.interceptors.response.use(response => response, function(error) {
  switch (error.response.status) {
    case 400:
      message.error(
        typeof error.response.data === "string"
          ? error.response.data
          : JSON.stringify(error.response.data)
      );
      break;
    case 401:
      message.warn("您未登录，请先登录");
      setTimeout(() => {
        window.location = "/login";
      }, 500);
      break;
    case 500:
      message.error("Internal Error");
      break;
    default:
      break;
  }

  return Promise.reject(error);
});

export default instance;
