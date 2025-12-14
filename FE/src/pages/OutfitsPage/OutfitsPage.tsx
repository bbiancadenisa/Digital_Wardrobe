/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  message,
  Modal,
  Pagination,
  Empty,
  Spin,
  Carousel,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OutfitsPage.css";

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

const OutfitsPage: React.FC = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState<number | null>(null);
  const pageSize = 12;
  const navigate = useNavigate();

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [outfitsRes, favoritesRes] = await Promise.all([
        axios.get(`${API_URL}/outfits`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const favoriteOutfitIds = favoritesRes.data.map(
        (fav: any) => fav.outfit_id
      );
      const outfitsWithFavorites = outfitsRes.data.map((outfit: Outfit) => ({
        ...outfit,
        is_favorite: favoriteOutfitIds.includes(outfit.id),
      }));

      setOutfits(outfitsWithFavorites);
    } catch (error) {
      console.error("Failed to fetch outfits:", error);
      message.error("Failed to load outfits");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!outfitToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/outfits/${outfitToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Outfit deleted successfully!");
      setOutfits(outfits.filter((o) => o.id !== outfitToDelete));
      setDeleteModalVisible(false);
      setOutfitToDelete(null);
    } catch (error) {
      message.error("Failed to delete outfit");
    }
  };

  const toggleFavorite = async (outfitId: number, isFavorite: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorites/${outfitId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Removed from favorites");
      } else {
        await axios.post(
          `${API_URL}/favorites/${outfitId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Added to favorites");
      }

      setOutfits(
        outfits.map((o) =>
          o.id === outfitId ? { ...o, is_favorite: !isFavorite } : o
        )
      );
    } catch (error) {
      message.error("Failed to update favorites");
    }
  };

  const renderOutfitImage = (outfit: Outfit) => {
    // If outfit has its own image
    if (outfit.image_url) {
      return (
        <div className="outfit-image-container">
          <img
            src={outfit.image_url}
            alt={outfit.name}
            className="outfit-image"
          />
        </div>
      );
    }

    const garmentImages = outfit.garments
      .filter((g) => g.image_url)
      .map((g) => g.image_url);

    if (garmentImages.length > 0) {
      return (
        <div className="outfit-image-container">
          <Carousel autoplay>
            {garmentImages.map((img, index) => (
              <div key={index}>
                <img
                  src={img}
                  alt={`Garment ${index + 1}`}
                  className="outfit-image"
                />
              </div>
            ))}
          </Carousel>
        </div>
      );
    }

    return (
      <div className="outfit-image-container outfit-placeholder">
        <div className="placeholder-content">
          <PlusOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
          <p>No Image</p>
        </div>
      </div>
    );
  };

  const paginatedOutfits = outfits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading outfits..." />
      </div>
    );
  }

  return (
    <div className="outfits-page">
      <div className="page-header">
        <h1>My Outfits</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate("/add-outfit")}
        >
          Create Outfit
        </Button>
      </div>

      {outfits.length === 0 ? (
        <Empty
          description="You don't have any outfits yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate("/add-outfit")}>
            Create Your First Outfit
          </Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {paginatedOutfits.map((outfit) => (
              <Col key={outfit.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  className="outfit-card"
                  cover={renderOutfitImage(outfit)}
                  actions={[
                    <Button
                      type="text"
                      icon={
                        outfit.is_favorite ? <HeartFilled /> : <HeartOutlined />
                      }
                      onClick={() =>
                        toggleFavorite(outfit.id, outfit.is_favorite || false)
                      }
                      className={outfit.is_favorite ? "favorite-active" : ""}
                    />,
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/outfits/${outfit.id}`)}
                    />,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setOutfitToDelete(outfit.id);
                        setDeleteModalVisible(true);
                      }}
                    />,
                  ]}
                >
                  <Card.Meta
                    title={outfit.name}
                    description={`${outfit.garments.length} items`}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {outfits.length > pageSize && (
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={outfits.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      <Modal
        title="Delete Outfit"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setOutfitToDelete(null);
        }}
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

export default OutfitsPage;
