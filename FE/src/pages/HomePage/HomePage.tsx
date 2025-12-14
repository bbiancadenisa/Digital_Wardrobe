import {
  AppstoreOutlined,
  HeartOutlined,
  PlusOutlined,
  ShoppingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Statistic, Typography } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/api.config";

const { Title, Paragraph } = Typography;

const API_URL = API_BASE_URL;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [totalGarments, setTotalGarments] = useState(0);
  const [totalOutfits, setTotalOutfits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [garmentsRes, outfitsRes] = await Promise.all([
        axios.get(`${API_URL}/garments`, config),
        axios.get(`${API_URL}/outfits`, config),
      ]);

      setTotalGarments(garmentsRes.data.length);
      setTotalOutfits(outfitsRes.data.length);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>Welcome to Digital Wardrobe</Title>
      <Paragraph style={{ fontSize: "16px", marginBottom: "32px" }}>
        This is the main page of the application. Here you can manage your
        digital wardrobe.
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12}>
          <Card loading={loading}>
            <Statistic
              title="Total Garments"
              value={totalGarments}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card loading={loading}>
            <Statistic
              title="Total Outfits"
              value={totalOutfits}
              prefix={<TagsOutlined />}
              valueStyle={{ color: "#667eea" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            style={{ textAlign: "center", borderRadius: "12px" }}
            onClick={() => navigate("/add-outfit")}
          >
            <PlusOutlined
              style={{
                fontSize: "48px",
                color: "#667eea",
                marginBottom: "16px",
              }}
            />
            <Title level={4}>Create New Outfit</Title>
            <Paragraph>
              Combine your garments to create stylish outfits
            </Paragraph>
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              Add Outfit
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            style={{ textAlign: "center", borderRadius: "12px" }}
            onClick={() => navigate("/wardrobe")}
          >
            <AppstoreOutlined
              style={{
                fontSize: "48px",
                color: "#52c41a",
                marginBottom: "16px",
              }}
            />
            <Title level={4}>My Wardrobe</Title>
            <Paragraph>View and manage your clothing collection</Paragraph>
            <Button size="large">View Wardrobe</Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            style={{ textAlign: "center", borderRadius: "12px" }}
            onClick={() => navigate("/favorites")}
          >
            <HeartOutlined
              style={{
                fontSize: "48px",
                color: "#ff4d4f",
                marginBottom: "16px",
              }}
            />
            <Title level={4}>Favorite Outfits</Title>
            <Paragraph>Quick access to your favorite combinations</Paragraph>
            <Button size="large">View Favorites</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
