import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Modal,
  Row,
  Col,
  Image,
  Empty,
  Upload,
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  SearchOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddOutfitPage.css";

const API_URL = "http://localhost:5000/api";

interface Garment {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  color: string;
  image_url?: string;
  season_id: number;
  style_id: number;
}

interface Category {
  id: number;
  name: string;
}

interface Season {
  id: number;
  name: string;
}

interface SelectedGarments {
  top?: Garment;
  bottom?: Garment;
  shoes?: Garment;
  jacket?: Garment;
}

const CATEGORY_GROUPS = {
  tops: ["t-shirt", "shirt", "blouse", "top", "sweater", "pullover", "hoodie"],
  bottoms: ["jeans", "pants", "trousers", "skirt", "shorts"],
  dresses: ["dress"],
  outerwear: ["jacket", "coat", "blazer"],
  footwear: ["shoes", "boots", "sneakers"],
};

const AddOutfitPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedGarments, setSelectedGarments] = useState<SelectedGarments>(
    {}
  );
  const [outfitImage, setOutfitImage] = useState<UploadFile[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<
    "top" | "bottom" | "shoes" | "jacket" | null
  >(null);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [filteredGarments, setFilteredGarments] = useState<Garment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [filterSeason, setFilterSeason] = useState<number | null>(null);
  const [filterColor, setFilterColor] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [garmentsRes, categoriesRes, seasonsRes] = await Promise.all([
        axios.get(`${API_URL}/garments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/seasons`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setGarments(garmentsRes.data);
      setCategories(categoriesRes.data);
      setSeasons(seasonsRes.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Failed to load data");
    }
  };

  const openModal = (type: "top" | "bottom" | "shoes" | "jacket") => {
    setCurrentSelection(type);
    setSearchQuery("");
    setFilterCategory(null);
    setFilterSeason(null);
    setFilterColor("");

    let categoryNames: string[] = [];
    if (type === "top")
      categoryNames = [...CATEGORY_GROUPS.tops, ...CATEGORY_GROUPS.dresses];
    else if (type === "bottom") categoryNames = CATEGORY_GROUPS.bottoms;
    else if (type === "shoes") categoryNames = CATEGORY_GROUPS.footwear;
    else if (type === "jacket") categoryNames = CATEGORY_GROUPS.outerwear;

    const filtered = garments.filter((g) =>
      categoryNames.some(
        (cat) => g.category_name?.toLowerCase() === cat.toLowerCase()
      )
    );
    setFilteredGarments(filtered);
    setModalVisible(true);
  };

  const applyFilters = () => {
    let categoryNames: string[] = [];
    if (currentSelection === "top")
      categoryNames = [...CATEGORY_GROUPS.tops, ...CATEGORY_GROUPS.dresses];
    else if (currentSelection === "bottom")
      categoryNames = CATEGORY_GROUPS.bottoms;
    else if (currentSelection === "shoes")
      categoryNames = CATEGORY_GROUPS.footwear;
    else if (currentSelection === "jacket")
      categoryNames = CATEGORY_GROUPS.outerwear;

    let filtered = garments.filter((g) =>
      categoryNames.some(
        (cat) => g.category_name?.toLowerCase() === cat.toLowerCase()
      )
    );

    if (searchQuery) {
      filtered = filtered.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterCategory) {
      filtered = filtered.filter((g) => g.category_id === filterCategory);
    }
    if (filterSeason) {
      filtered = filtered.filter((g) => g.season_id === filterSeason);
    }
    if (filterColor) {
      filtered = filtered.filter((g) =>
        g.color?.toLowerCase().includes(filterColor.toLowerCase())
      );
    }

    setFilteredGarments(filtered);
  };

  useEffect(() => {
    if (modalVisible) applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterCategory, filterSeason, filterColor]);

  const selectGarment = (garment: Garment) => {
    if (currentSelection) {
      setSelectedGarments((prev) => ({ ...prev, [currentSelection]: garment }));
      setModalVisible(false);
    }
  };

  const removeGarment = (type: "top" | "bottom" | "shoes" | "jacket") => {
    setSelectedGarments((prev) => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };

  const isDressSelected = () => {
    return (
      selectedGarments.top &&
      CATEGORY_GROUPS.dresses.includes(
        selectedGarments.top.category_name?.toLowerCase()
      )
    );
  };

  const onFinish = async (values: { name: string }) => {
    const garmentIds = [
      selectedGarments.top?.id,
      selectedGarments.bottom?.id,
      selectedGarments.shoes?.id,
      selectedGarments.jacket?.id,
    ].filter(Boolean) as number[];

    if (!selectedGarments.top) {
      message.error("Please select a top!");
      return;
    }
    if (!isDressSelected() && !selectedGarments.bottom) {
      message.error("Please select a bottom!");
      return;
    }
    if (!selectedGarments.shoes) {
      message.error("Please select shoes!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("garment_ids", JSON.stringify(garmentIds));

      if (outfitImage.length > 0 && outfitImage[0].originFileObj) {
        formData.append("image", outfitImage[0].originFileObj);
      }

      await axios.post(`${API_URL}/outfits`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      message.success("Outfit created successfully!");
      navigate("/outfits");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "Failed to create outfit");
    } finally {
      setLoading(false);
    }
  };

  const renderGarmentSelection = (
    type: "top" | "bottom" | "shoes" | "jacket",
    label: string,
    required: boolean
  ) => {
    const garment = selectedGarments[type];
    const isBottomOptional = type === "bottom" && isDressSelected();

    return (
      <div className="garment-selection-item">
        <h3 className="garment-label">
          {label}{" "}
          {required && !isBottomOptional && (
            <span className="required-mark">*</span>
          )}
        </h3>
        {garment ? (
          <div className="selected-garment">
            {garment.image_url ? (
              <Image
                src={garment.image_url}
                alt={garment.name}
                className="garment-image"
                preview={false}
              />
            ) : (
              <div className="garment-placeholder">{garment.name}</div>
            )}
            <Button
              type="text"
              icon={<CloseOutlined />}
              className="remove-garment-btn"
              onClick={() => removeGarment(type)}
              danger
            />
          </div>
        ) : (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            className="add-garment-btn"
            onClick={() => openModal(type)}
          >
            Add {label}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="add-outfit-page">
      <Card
        className="add-outfit-card"
        title={
          <div className="card-title">
            <PlusOutlined />
            <span>Create New Outfit</span>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="outfit-form"
        >
          <Form.Item
            name="name"
            label="Outfit Name"
            rules={[
              { required: true, message: "Please enter outfit name!" },
              { min: 3, message: "Name must be at least 3 characters!" },
            ]}
          >
            <Input
              placeholder="e.g., Casual Friday, Summer Beach"
              size="large"
            />
          </Form.Item>

          <Form.Item label="Outfit Photo (Optional)">
            <Upload
              listType="picture-card"
              fileList={outfitImage}
              onChange={({ fileList }) => setOutfitImage(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
            >
              {outfitImage.length === 0 && (
                <div>
                  <CameraOutlined style={{ fontSize: 24 }} />
                  <div style={{ marginTop: 8 }}>Upload Photo</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <div className="garments-selection">
            {renderGarmentSelection("top", "Top", true)}
            {renderGarmentSelection("bottom", "Bottom", !isDressSelected())}
            {renderGarmentSelection("shoes", "Shoes", true)}
            {renderGarmentSelection("jacket", "Jacket", false)}
          </div>

          <Form.Item className="form-actions">
            <Button
              type="default"
              size="large"
              onClick={() => navigate("/")}
              style={{ marginRight: "12px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Save Outfit
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title={`Select ${
          currentSelection
            ? currentSelection.charAt(0).toUpperCase() +
              currentSelection.slice(1)
            : ""
        }`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        className="garment-selection-modal"
      >
        <div className="modal-filters">
          <Input
            placeholder="Search garments..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Row gutter={16}>
            <Col span={8}>
              <select
                className="filter-select"
                value={filterCategory || ""}
                onChange={(e) =>
                  setFilterCategory(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Col>
            <Col span={8}>
              <select
                className="filter-select"
                value={filterSeason || ""}
                onChange={(e) =>
                  setFilterSeason(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">All Seasons</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
            </Col>
            <Col span={8}>
              <Input
                placeholder="Filter by color"
                value={filterColor}
                onChange={(e) => setFilterColor(e.target.value)}
              />
            </Col>
          </Row>
        </div>

        <div className="modal-garments-grid">
          {filteredGarments.length === 0 ? (
            <Empty description="No garments found" />
          ) : (
            filteredGarments.map((garment) => (
              <div
                key={garment.id}
                className="modal-garment-card"
                onClick={() => selectGarment(garment)}
              >
                {garment.image_url ? (
                  <Image
                    src={garment.image_url}
                    alt={garment.name}
                    preview={false}
                  />
                ) : (
                  <div className="modal-garment-placeholder">
                    {garment.name}
                  </div>
                )}
                <div className="modal-garment-info">
                  <p className="modal-garment-name">{garment.name}</p>
                  <p className="modal-garment-details">{garment.color}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AddOutfitPage;
