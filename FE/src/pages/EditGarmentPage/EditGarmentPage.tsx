/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable react-hooks/exhaustive-deps */
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Select,
  Spin,
  Upload,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditGarmentPage.css";

import { API_BASE_URL } from "../../services/api.config";

const API_URL = API_BASE_URL;

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

interface Garment {
  id: number;
  name: string;
  image_url?: string;
  color: string;
  category_id: number;
  style_id: number;
  season_id: number;
}

const EditGarmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [garment, setGarment] = useState<Garment | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [affectedOutfits, setAffectedOutfits] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [garmentRes, categoriesRes, stylesRes, seasonsRes] =
        await Promise.all([
          axios.get(`${API_URL}/garments/${id}`, config),
          axios.get(`${API_URL}/categories`, config),
          axios.get(`${API_URL}/styles`, config),
          axios.get(`${API_URL}/seasons`, config),
        ]);

      setGarment(garmentRes.data);
      setCategories(categoriesRes.data);
      setStyles(stylesRes.data);
      setSeasons(seasonsRes.data);

      form.setFieldsValue({
        name: garmentRes.data.name,
        color: garmentRes.data.color,
        category_id: garmentRes.data.category_id,
        style_id: garmentRes.data.style_id,
        season_id: garmentRes.data.season_id,
      });

      if (garmentRes.data.image_url) {
        setFileList([
          {
            uid: "-1",
            name: "Current Image",
            status: "done",
            url: garmentRes.data.image_url,
          },
        ]);
      }
    } catch (error) {
      message.error("Failed to load garment details");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/garments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Garment deleted successfully");
      navigate("/wardrobe");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to delete garment";
      message.error(errorMessage);
      setDeleteModalVisible(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("color", values.color);
      formData.append("category_id", values.category_id);
      formData.append("style_id", values.style_id);
      formData.append("season_id", values.season_id);

      // Only append image if a new one was selected
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      await axios.put(`${API_URL}/garments/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Garment updated successfully!");
      navigate("/wardrobe");
    } catch (error) {
      message.error("Failed to update garment");
      console.error("Error updating garment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading garment details..." />
      </div>
    );
  }

  if (!garment) {
    return (
      <div className="error-container">
        <p>Garment not found</p>
        <Button onClick={() => navigate("/wardrobe")}>Back to Wardrobe</Button>
      </div>
    );
  }

  return (
    <div className="edit-garment-page">
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/wardrobe")}
        >
          Back
        </Button>
        <h1>Edit Garment</h1>
        <Button icon={<DeleteOutlined />} danger onClick={handleDelete}>
          Delete
        </Button>
      </div>

      <Card className="edit-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="edit-garment-form"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter garment name" }]}
          >
            <Input placeholder="e.g., Blue Jeans" />
          </Form.Item>

          <Form.Item
            label="Color"
            name="color"
            rules={[{ required: true, message: "Please enter color" }]}
          >
            <Input placeholder="e.g., Blue" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category_id"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select placeholder="Select category">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Style"
            name="style_id"
            rules={[{ required: true, message: "Please select a style" }]}
          >
            <Select placeholder="Select style">
              {styles.map((style) => (
                <Select.Option key={style.id} value={style.id}>
                  {style.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Season"
            name="season_id"
            rules={[{ required: true, message: "Please select a season" }]}
          >
            <Select placeholder="Select season">
              {seasons.map((season) => (
                <Select.Option key={season.id} value={season.id}>
                  {season.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Update Garment
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title={
          affectedOutfits.length > 0
            ? "Warning: Deleting Garment"
            : "Delete Garment"
        }
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setAffectedOutfits([]);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        {affectedOutfits.length > 0 ? (
          <div>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>
              This garment is used in {affectedOutfits.length} outfit(s):
            </p>
            <ul style={{ marginBottom: 16 }}>
              {affectedOutfits.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
            <p style={{ color: "#ff4d4f" }}>
              If you delete this garment, all associated outfits will also be
              deleted. Are you sure you want to continue?
            </p>
          </div>
        ) : (
          <p>Are you sure you want to delete this garment?</p>
        )}
      </Modal>
    </div>
  );
};

export default EditGarmentPage;
