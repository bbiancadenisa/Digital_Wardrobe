import {
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Image,
  Input,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/api.config";
import "./WardrobePage.css";

const API_URL = API_BASE_URL;
const { Search } = Input;
const { Option } = Select;

interface Garment {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  style_id: number;
  style_name?: string;
  season_id: number;
  season_name?: string;
  color: string;
  image_url?: string;
  environment?: string;
  material?: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface Season {
  id: number;
  name: string;
}

const WardrobePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [garmentToDelete, setGarmentToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, selectedSeason, selectedColor]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedSeason) params.season_id = selectedSeason;
      if (selectedColor) params.color = selectedColor;

      const [garmentsRes, categoriesRes, seasonsRes] = await Promise.all([
        axios.get(`${API_URL}/garments`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
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
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(undefined);
    setSelectedSeason(undefined);
    setSelectedColor(undefined);
    setCurrentPage(1);
  };

  const handleDeleteGarment = async (garmentId: number) => {
    setGarmentToDelete(garmentId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!garmentToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/garments/${garmentToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Garment deleted successfully");
      setDeleteModalVisible(false);
      setGarmentToDelete(null);
      fetchData();
    } catch (error: any) {
      console.error("Failed to delete garment:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to delete garment";
      message.error(errorMessage);
      setDeleteModalVisible(false);
      setGarmentToDelete(null);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedGarments = garments.slice(startIndex, endIndex);

  const hasActiveFilters =
    searchQuery || selectedCategory || selectedSeason || selectedColor;

  return (
    <div className="wardrobe-page">
      {/* Header with Search and Filters */}
      <div className="wardrobe-header">
        <div className="header-title">
          <h2>My Wardrobe</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate("/add-garment")}
          >
            Add Garment
          </Button>
        </div>

        <Card className="filters-card">
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {/* Search Bar */}
            <Search
              placeholder="Search garments by name..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />

            {/* Filters Row */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Category"
                  allowClear
                  style={{ width: "100%" }}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                >
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Season/Weather"
                  allowClear
                  style={{ width: "100%" }}
                  value={selectedSeason}
                  onChange={setSelectedSeason}
                >
                  {seasons.map((season) => (
                    <Option key={season.id} value={season.id}>
                      {season.name}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Color"
                  allowClear
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                />
              </Col>
            </Row>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button icon={<FilterOutlined />} onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            )}
          </Space>
        </Card>
      </div>

      {/* Garments Grid */}
      <div className="garments-section">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="Loading garments..." />
          </div>
        ) : garments.length === 0 ? (
          <Empty
            description={
              hasActiveFilters
                ? "No garments match your filters"
                : "You don't have any garments yet"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {!hasActiveFilters && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/add-garment")}
              >
                Add Your First Garment
              </Button>
            )}
          </Empty>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {paginatedGarments.map((garment) => (
                <Col xs={24} sm={12} md={8} lg={6} key={garment.id}>
                  <Card
                    hoverable
                    className="garment-card"
                    cover={
                      garment.image_url ? (
                        <Image
                          alt={garment.name}
                          src={garment.image_url}
                          height={200}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )
                    }
                    actions={[
                      <Tooltip title="View/Edit">
                        <EyeOutlined
                          onClick={() =>
                            navigate(`/wardrobe/edit/${garment.id}`)
                          }
                        />
                      </Tooltip>,
                      <Tooltip title="Delete">
                        <DeleteOutlined
                          onClick={() => handleDeleteGarment(garment.id)}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <Card.Meta
                      title={garment.name || "Unnamed"}
                      description={
                        <Space direction="vertical" size="small">
                          {garment.category_name && (
                            <Tag color="blue">{garment.category_name}</Tag>
                          )}
                          {garment.season_name && (
                            <Tag color="orange">{garment.season_name}</Tag>
                          )}
                          {garment.color && <Tag>{garment.color}</Tag>}
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {garments.length > pageSize && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  total={garments.length}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showTotal={(total) => `Total ${total} garments`}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Garment"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setGarmentToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this garment?</p>
      </Modal>
    </div>
  );
};

export default WardrobePage;
