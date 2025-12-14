/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FilterOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Image,
  message,
  Modal,
  Row,
  Select,
  Spin,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../services/api.config";
import "./RecommendedPage.css";

const API_URL = API_BASE_URL;
const { Option } = Select;

interface Garment {
  id: number;
  name: string;
  image_url?: string;
  color: string;
  category_name: string;
}

interface RecommendedOutfit {
  top?: Garment;
  bottom?: Garment;
  shoes?: Garment;
  jacket?: Garment;
  dress?: Garment;
}

interface Season {
  id: number;
  name: string;
}

interface Style {
  id: number;
  name: string;
}

const RecommendedPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<RecommendedOutfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [filterSeason, setFilterSeason] = useState<string | null>(null);
  const [filterStyle, setFilterStyle] = useState<string | null>(null);
  const [filterEnvironment, setFilterEnvironment] = useState<string | null>(
    null
  );
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [outfitToSave, setOutfitToSave] = useState<RecommendedOutfit | null>(
    null
  );
  const [outfitName, setOutfitName] = useState("");

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const token = localStorage.getItem("token");
      const [seasonsRes, stylesRes] = await Promise.all([
        axios.get(`${API_URL}/seasons`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/styles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSeasons(seasonsRes.data);
      setStyles(stylesRes.data);
    } catch (error) {
      console.error("Failed to fetch filters:", error);
    }
  };

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/suggestions`,
        {
          season: filterSeason,
          style: filterStyle,
          environment: filterEnvironment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const transformedSuggestions = response.data.map((item: any) => {
        const outfit: RecommendedOutfit = {};

        item.garments.forEach((garment: Garment) => {
          const catName = garment.category_name?.toLowerCase();

          // Map to outfit structure
          if (catName === "dress") {
            outfit.dress = garment;
          } else if (
            [
              "t-shirt",
              "shirt",
              "blouse",
              "top",
              "sweater",
              "pullover",
              "hoodie",
            ].includes(catName)
          ) {
            outfit.top = garment;
          } else if (
            ["jeans", "pants", "trousers", "skirt", "shorts"].includes(catName)
          ) {
            outfit.bottom = garment;
          } else if (["shoes", "boots", "sneakers"].includes(catName)) {
            outfit.shoes = garment;
          } else if (["jacket", "coat", "blazer"].includes(catName)) {
            outfit.jacket = garment;
          }
        });

        return outfit;
      });

      setSuggestions(transformedSuggestions);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMessage =
        err.response?.data?.error || "Failed to generate suggestions";
      message.error(errorMessage);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutfit = async () => {
    if (!outfitToSave || !outfitName.trim()) {
      message.error("Please enter an outfit name");
      return;
    }

    const garmentIds = [
      outfitToSave.top?.id,
      outfitToSave.bottom?.id,
      outfitToSave.shoes?.id,
      outfitToSave.jacket?.id,
      outfitToSave.dress?.id,
    ].filter(Boolean) as number[];

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/outfits`,
        {
          name: outfitName,
          garment_ids: garmentIds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Outfit saved successfully!");
      setSaveModalVisible(false);
      setOutfitName("");
      setOutfitToSave(null);
    } catch (error: unknown) {
      console.error("Failed to save outfit:", error);
      message.error("Failed to save outfit");
    }
  };

  const renderGarmentCard = (garment?: Garment) => {
    if (!garment) return null;

    return (
      <div className="suggestion-garment-card">
        {garment.image_url ? (
          <Image
            src={garment.image_url}
            alt={garment.name}
            className="suggestion-garment-image"
            preview={false}
          />
        ) : (
          <div className="suggestion-garment-placeholder">
            {garment.category_name}
          </div>
        )}
        <div className="suggestion-garment-info">
          <div className="suggestion-garment-name">{garment.name}</div>
          <div className="suggestion-garment-color">{garment.color}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="recommended-page">
      <div className="recommended-header">
        <h1>Recommended Outfits</h1>
        <p>Get personalized outfit suggestions based on your wardrobe</p>
      </div>

      <Card className="filters-card">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder="Filter by season"
              size="large"
              allowClear
              style={{ width: "100%" }}
              value={filterSeason}
              onChange={(value) => setFilterSeason(value)}
            >
              {seasons.map((season) => (
                <Option key={season.id} value={season.name}>
                  {season.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder="Filter by style"
              size="large"
              allowClear
              style={{ width: "100%" }}
              value={filterStyle}
              onChange={(value) => setFilterStyle(value)}
            >
              {styles.map((style) => (
                <Option key={style.id} value={style.name}>
                  {style.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder="Filter by environment"
              size="large"
              allowClear
              style={{ width: "100%" }}
              value={filterEnvironment}
              onChange={(value) => setFilterEnvironment(value)}
            >
              <Option value="indoor">Indoor</Option>
              <Option value="outdoor">Outdoor</Option>
              <Option value="both">Both</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={9}>
            <Button
              type="primary"
              size="large"
              icon={<FilterOutlined />}
              onClick={fetchSuggestions}
              loading={loading}
              style={{ marginRight: "8px" }}
            >
              Generate Suggestions
            </Button>
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => {
                setFilterSeason(null);
                setFilterStyle(null);
                setFilterEnvironment(null);
                setSuggestions([]);
              }}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="Generating outfit suggestions..." />
        </div>
      ) : suggestions.length === 0 ? (
        <Empty
          description="No suggestions yet. Click 'Generate Suggestions' to get started!"
          style={{ marginTop: "50px" }}
        />
      ) : (
        <Row gutter={[24, 24]} className="suggestions-grid">
          {suggestions.map((outfit, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                className="suggestion-card"
                actions={[
                  <Button
                    type="text"
                    icon={<SaveOutlined />}
                    onClick={() => {
                      setOutfitToSave(outfit);
                      setSaveModalVisible(true);
                    }}
                  >
                    Save Outfit
                  </Button>,
                ]}
              >
                <div className="suggestion-title">Outfit #{index + 1}</div>
                <div className="suggestion-garments">
                  {outfit.dress && (
                    <div className="suggestion-row">
                      <label>Dress:</label>
                      {renderGarmentCard(outfit.dress)}
                    </div>
                  )}
                  {outfit.top && (
                    <div className="suggestion-row">
                      <label>Top:</label>
                      {renderGarmentCard(outfit.top)}
                    </div>
                  )}
                  {outfit.bottom && (
                    <div className="suggestion-row">
                      <label>Bottom:</label>
                      {renderGarmentCard(outfit.bottom)}
                    </div>
                  )}
                  {outfit.shoes && (
                    <div className="suggestion-row">
                      <label>Shoes:</label>
                      {renderGarmentCard(outfit.shoes)}
                    </div>
                  )}
                  {outfit.jacket && (
                    <div className="suggestion-row">
                      <label>Jacket:</label>
                      {renderGarmentCard(outfit.jacket)}
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Save Outfit"
        open={saveModalVisible}
        onOk={handleSaveOutfit}
        onCancel={() => {
          setSaveModalVisible(false);
          setOutfitName("");
          setOutfitToSave(null);
        }}
        okText="Save"
      >
        <p>Enter a name for this outfit:</p>
        <input
          type="text"
          className="outfit-name-input"
          placeholder="e.g., Summer Casual"
          value={outfitName}
          onChange={(e) => setOutfitName(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            fontSize: "14px",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
          }}
        />
      </Modal>
    </div>
  );
};

export default RecommendedPage;
