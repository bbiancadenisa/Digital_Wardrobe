import React from "react";
import { Layout, Menu, Button, Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined,
  HeartOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../contexts/useAuth";
import "./MainLayout.css";

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      key: "/wardrobe",
      icon: <AppstoreOutlined />,
      label: "Wardrobe",
      onClick: () => navigate("/wardrobe"),
    },
    {
      key: "/outfits",
      icon: <PlusOutlined />,
      label: "Outfits",
      onClick: () => navigate("/outfits"),
    },
    {
      key: "/favorites",
      icon: <HeartOutlined />,
      label: "Favorites",
      onClick: () => navigate("/favorites"),
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-content">
          <div className="logo">
            <AppstoreOutlined
              style={{ fontSize: "24px", marginRight: "8px" }}
            />
            <span>Digital Wardrobe</span>
          </div>
          <div className="user-section">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" className="user-button">
                <Avatar icon={<UserOutlined />} />
                <span className="username">
                  {user?.username || user?.email}
                </span>
              </Button>
            </Dropdown>
          </div>
        </div>
      </Header>
      <Layout>
        <Sider
          width={250}
          className="main-sider"
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="sidebar-menu"
          />
        </Sider>
        <Layout className="content-layout">
          <Content className="main-content">
            <div className="content-wrapper">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
