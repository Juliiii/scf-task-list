import React from "react";
import axios from "../libs/axios";
import "./Register.css";
import { Form, Input, Icon, Button, message } from "antd";

class RegistrationForm extends React.Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: []
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);

        await axios.post("/register", {
          user: values.user,
          password: values.password
        });

        message.success("注册成功");

        setTimeout(() => {
          window.location = "/login";
        }, 500);
      }
    });
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue("password")) {
      callback("Two passwords that you enter is inconsistent!");
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit} className="register-form">
        <Form.Item>
          {getFieldDecorator("user", {
            rules: [
              {
                required: true,
                message: "Please input user!",
                whitespace: true
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="User"
            />
          )}
        </Form.Item>
        <Form.Item hasFeedback>
          {getFieldDecorator("password", {
            rules: [
              {
                required: true,
                message: "Please input your password!"
              },
              {
                validator: this.validateToNextPassword
              }
            ]
          })(
            <Input.Password
              placeholder="Password"
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
            />
          )}
        </Form.Item>
        <Form.Item hasFeedback>
          {getFieldDecorator("confirmPassword", {
            rules: [
              {
                required: true,
                message: "Please confirm your password!"
              },
              {
                validator: this.compareToFirstPassword
              }
            ]
          })(
            <Input.Password
              placeholder="Confirm Password"
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              onBlur={this.handleConfirmBlur}
            />
          )}
        </Form.Item>

        <Form.Item className="sumbit-button-formitem">
          <Button type="primary" htmlType="submit" className="submit-button">
            Register
          </Button>
          Or <a href="/login">login now!</a>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedRegistrationForm = Form.create({ name: "register" })(
  RegistrationForm
);

export default function() {
  return (
    <div id="register">
      <WrappedRegistrationForm />
    </div>
  );
}
