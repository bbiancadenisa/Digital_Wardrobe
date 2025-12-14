import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Select, Upload } from "antd";
import { PlusOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { UploadFile } from "antd";
import "./AddGarmentPage.css";

const API_URL = "http://localhost:5000/api";
const { Option } = Select;

interface Category {
  id: number;
  name: string;
}

interface Style {
  id: number;
  name: string;
}

interface Season {
  id: number;
  name: string;
}

const AddGarmentPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [categoriesRes, stylesRes, seasonsRes] = await Promise.all([
        axios.get(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/styles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/seasons`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCategories(categoriesRes.data);
      setStyles(stylesRes.data);
      setSeasons(seasonsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Failed to load form data");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("category_id", values.category_id);
      formData.append("style_id", values.style_id);
      formData.append("season_id", values.season_id);
      formData.append("color", values.color);
      if (values.environment)
        formData.append("environment", values.environment);
      if (values.material) formData.append("material", values.material);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      await axios.post(`${API_URL}/garments`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Garment added successfully!");
      navigate("/wardrobe");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "Failed to add garment");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList.slice(-1));
  };

  return (
    <div className="add-garment-page">
      <Card
        className="add-garment-card"
        title={
          <div className="card-title">
            <PlusOutlined />
            <span>Add New Garment</span>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="garment-form"
        >
          <Form.Item
            name="name"
            label="Garment Name"
            rules={[{ required: true, message: "Please enter garment name!" }]}
          >
            <Input placeholder="e.g., Blue Denim Jeans" size="large" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <Select placeholder="Select category" size="large">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="style_id"
            label="Style"
            rules={[{ required: true, message: "Please select a style!" }]}
          >
            <Select placeholder="Select style" size="large">
              {styles.map((style) => (
                <Option key={style.id} value={style.id}>
                  {style.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="season_id"
            label="Season / Weather"
            rules={[{ required: true, message: "Please select a season!" }]}
          >
            <Select placeholder="Select season" size="large">
              {seasons.map((season) => (
                <Option key={season.id} value={season.id}>
                  {season.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
            rules={[{ required: true, message: "Please enter color!" }]}
          >
            <Input placeholder="e.g., Blue, Red, Black" size="large" />
          </Form.Item>

          <Form.Item name="environment" label="Environment">
            <Select placeholder="Select environment" size="large" allowClear>
              <Option value="indoor">Indoor</Option>
              <Option value="outdoor">Outdoor</Option>
              <Option value="both">Both</Option>
            </Select>
          </Form.Item>

          <Form.Item name="material" label="Material">
            <Input placeholder="e.g., Cotton, Denim, Leather" size="large" />
          </Form.Item>

          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item className="form-actions">
            <Button
              type="default"
              size="large"
              onClick={() => navigate("/wardrobe")}
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
              Save Garment
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddGarmentPage;
