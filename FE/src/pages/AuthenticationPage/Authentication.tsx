import React, { useState } from "react";
import { Form, Input, Button, Card, message, Divider, Tabs } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import "./Authentication.css";

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginFormValues {
  email: string;
  password: string;
}

const Authentication: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("register");
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [registerForm] = Form.useForm();
  const [loginForm] = Form.useForm();

  const onRegister = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await register(values.username, values.email, values.password);
      message.success("Account created successfully! Welcome!");
      navigate("/");
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success("Login successful!");
      navigate("/");
    } catch (error: unknown) {
      const err = error as Error;
      message.error(
        err.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const registerTab = (
    <Form
      form={registerForm}
      name="register"
      onFinish={onRegister}
      layout="vertical"
      size="large"
      className="auth-form"
    >
      <Form.Item
        name="username"
        label="Username"
        rules={[
          { required: true, message: "Please enter your username!" },
          { min: 3, message: "Username must be at least 3 characters!" },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Enter your username"
          autoComplete="username"
        />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please enter your email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="example@email.com"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: "Please enter your password!" },
          { min: 6, message: "Password must be at least 6 characters!" },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Please confirm your password!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match!"));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Confirm your password"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="auth-button"
          block
        >
          Create Account
        </Button>
      </Form.Item>
    </Form>
  );

  const loginTab = (
    <Form
      form={loginForm}
      name="login"
      onFinish={onLogin}
      layout="vertical"
      size="large"
      className="auth-form"
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please enter your email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="example@email.com"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: "Please enter your password!" }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="auth-button"
          block
        >
          Login
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: "register",
      label: "Register",
      children: registerTab,
    },
    {
      key: "login",
      label: "Login",
      children: loginTab,
    },
  ];

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <div className="auth-header">
            <div className="logo-section">
              <UserOutlined className="logo-icon" />
              <h1>Digital Wardrobe</h1>
            </div>
            <p className="subtitle">
              {activeTab === "register"
                ? "Create a new account to manage your wardrobe."
                : "Welcome back! Sign in to your account."}
            </p>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            centered
            className="auth-tabs"
          />

          <Divider plain>or</Divider>

          <div className="alternative-section">
            {activeTab === "register" ? (
              <p>
                Already have an account?{" "}
                <span
                  onClick={() => setActiveTab("login")}
                  className="alternative-link"
                >
                  Sign in here
                </span>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <span
                  onClick={() => setActiveTab("register")}
                  className="alternative-link"
                >
                  Register now
                </span>
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Authentication;
