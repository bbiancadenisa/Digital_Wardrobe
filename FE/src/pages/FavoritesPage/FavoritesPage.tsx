import { EyeOutlined, HeartFilled, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Carousel,
  Col,
  Empty,
  message,
  Modal,
  Pagination,
  Row,
  Spin,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FavoritesPage.css";

import { API_BASE_URL } from "../../services/api.config";

const API_URL = API_BASE_URL;

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

const FavoritesPage: React.FC = () => {
  const [favoriteOutfits, setFavoriteOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState<number | null>(null);
  const pageSize = 12;
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const outfits = response.data.map((fav: any) => ({
        ...fav.outfit,
        is_favorite: true,
      }));

      setFavoriteOutfits(outfits);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      message.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (outfitId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/favorites/${outfitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Removed from favorites");
      setFavoriteOutfits(favoriteOutfits.filter((o) => o.id !== outfitId));
      setDeleteModalVisible(false);
      setOutfitToDelete(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Failed to remove from favorites");
    }
  };

  const renderOutfitImage = (outfit: Outfit) => {
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

  const paginatedOutfits = favoriteOutfits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading favorites..." />
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1>My Favorite Outfits</h1>
      </div>

      {favoriteOutfits.length === 0 ? (
        <Empty
          description="No favorite outfits yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate("/outfits")}>
            Browse Outfits
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
                      icon={<HeartFilled />}
                      onClick={() => {
                        setOutfitToDelete(outfit.id);
                        setDeleteModalVisible(true);
                      }}
                      className="favorite-active"
                    />,
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/outfits/${outfit.id}`)}
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

          {favoriteOutfits.length > pageSize && (
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={favoriteOutfits.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      <Modal
        title="Remove from Favorites"
        open={deleteModalVisible}
        onOk={() => outfitToDelete && removeFavorite(outfitToDelete)}
        onCancel={() => {
          setDeleteModalVisible(false);
          setOutfitToDelete(null);
        }}
        okText="Remove"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to remove this outfit from favorites?</p>
      </Modal>
    </div>
  );
};

export default FavoritesPage;
