/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, message, Modal, Spin, Image, Row, Col, Tag } from "antd";
import {
  DeleteOutlined,
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import axios from "axios";
import "./OutfitDetailsPage.css";

const API_URL = "http://localhost:5000/api";

interface Garment {
  id: number;
  name: string;
  image_url?: string;
  color: string;
  category_name: string;
}

interface Outfit {
  id: number;
  name: string;
  image_url?: string;
  created_at: string;
  garments: Garment[];
  is_favorite?: boolean;
}

const OutfitDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchOutfitDetails();
    checkIfFavorite();
  }, [id]);

  const fetchOutfitDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/outfits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOutfit(response.data);
    } catch (error) {
      message.error("Failed to load outfit details");
      console.error("Error fetching outfit:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const isFav = response.data.some(
        (fav: any) => fav.outfit_id === Number(id)
      );
      setIsFavorite(isFav);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Removed from favorites");
        setIsFavorite(false);
      } else {
        await axios.post(
          `${API_URL}/favorites/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        message.success("Added to favorites");
        setIsFavorite(true);
      }
    } catch (error) {
      message.error("Failed to update favorites");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/outfits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Outfit deleted successfully");
      navigate("/outfits");
    } catch (error) {
      message.error("Failed to delete outfit");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading outfit details..." />
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="error-container">
        <p>Outfit not found</p>
        <Button onClick={() => navigate("/outfits")}>Back to Outfits</Button>
      </div>
    );
  }

  return (
    <div className="outfit-details-page">
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/outfits")}
        >
          Back
        </Button>
        <h1>{outfit.name}</h1>
        <div className="header-actions">
          <Button
            icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
            onClick={toggleFavorite}
            className={isFavorite ? "favorite-active" : ""}
          >
            {isFavorite ? "Favorited" : "Add to Favorites"}
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => setDeleteModalVisible(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="outfit-content">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Outfit Image" className="outfit-image-card">
              {outfit.image_url ? (
                <Image src={outfit.image_url} alt={outfit.name} />
              ) : (
                <div className="no-image-placeholder">
                  <p>No outfit image available</p>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Outfit Information" className="outfit-info-card">
              <p>
                <strong>Name:</strong> {outfit.name}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(outfit.created_at).toLocaleDateString()}
              </p>
              <p>
                <strong>Total Items:</strong> {outfit.garments.length}
              </p>
            </Card>
          </Col>
        </Row>

        <Card
          title={`Garments (${outfit.garments.length})`}
          className="garments-card"
        >
          <Row gutter={[16, 16]}>
            {outfit.garments.map((garment) => (
              <Col key={garment.id} xs={12} sm={8} md={6} lg={4}>
                <Card
                  hoverable
                  cover={
                    garment.image_url ? (
                      <img src={garment.image_url} alt={garment.name} />
                    ) : (
                      <div className="garment-no-image">No Image</div>
                    )
                  }
                  onClick={() => navigate(`/wardrobe`)}
                >
                  <Card.Meta
                    title={garment.name}
                    description={
                      <div>
                        <Tag color="blue">{garment.category_name}</Tag>
                        <Tag>{garment.color}</Tag>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>

      <Modal
        title="Delete Outfit"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete this outfit? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
};

export default OutfitDetailsPage;
