/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { Button, Card, Form, Input, message, Select, Upload } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddGarmentPage.css";

import { API_BASE_URL } from "../../services/api.config";

const API_URL = API_BASE_URL;
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
  const [categorySearch, setCategorySearch] = useState("");
  const [styleSearch, setStyleSearch] = useState("");
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

  const createNewCategory = async (name: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/categories`,
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newCategory = response.data;
      setCategories([...categories, newCategory]);
      form.setFieldsValue({ category_id: newCategory.id });
      setCategorySearch("");
      message.success(`Category "${name}" created successfully!`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error("This category already exists!");
      } else {
        message.error("Failed to create category");
      }
    }
  };

  const createNewStyle = async (name: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/styles`,
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newStyle = response.data;
      setStyles([...styles, newStyle]);
      form.setFieldsValue({ style_id: newStyle.id });
      setStyleSearch("");
      message.success(`Style "${name}" created successfully!`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error("This style already exists!");
      } else {
        message.error("Failed to create style");
      }
    }
  };

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
            <Select
              placeholder="Select category"
              size="large"
              showSearch
              onSearch={(value) => setCategorySearch(value)}
              filterOption={(input, option) =>
                String(option?.label || "")
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {categorySearch && categorySearch.trim().length > 0 && (
                    <div
                      style={{ padding: "8px", borderTop: "1px solid #f0f0f0" }}
                    >
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => createNewCategory(categorySearch)}
                        style={{ width: "100%", textAlign: "left" }}
                      >
                        Add "{categorySearch}"
                      </Button>
                    </div>
                  )}
                </>
              )}
            >
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
            <Select
              placeholder="Select style"
              size="large"
              showSearch
              onSearch={(value) => setStyleSearch(value)}
              filterOption={(input, option) =>
                String(option?.label || "")
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {styleSearch && styleSearch.trim().length > 0 && (
                    <div
                      style={{ padding: "8px", borderTop: "1px solid #f0f0f0" }}
                    >
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => createNewStyle(styleSearch)}
                        style={{ width: "100%", textAlign: "left" }}
                      >
                        Add "{styleSearch}"
                      </Button>
                    </div>
                  )}
                </>
              )}
            >
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
