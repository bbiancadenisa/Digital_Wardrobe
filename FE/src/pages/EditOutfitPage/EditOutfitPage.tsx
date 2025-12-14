import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { Button, Card, Form, Image, Input, message, Spin, Upload } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../services/api.config";
import "./EditOutfitPage.css";

const API_URL = API_BASE_URL;

interface Outfit {
  id: number;
  name: string;
  image_url?: string;
}

const EditOutfitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOutfit();
  }, [id]);

  const fetchOutfit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/outfits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const outfitData = response.data;
      setOutfit(outfitData);
      form.setFieldsValue({
        name: outfitData.name,
      });
    } catch (error) {
      message.error("Failed to load outfit");
      navigate("/outfits");
    } finally {
      setFetching(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList.slice(-1));
  };

  const onFinish = async (values: { name: string }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", values.name);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      await axios.patch(`${API_URL}/outfits/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Outfit updated successfully!");
      navigate(`/outfits/${id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "Failed to update outfit");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="edit-outfit-page">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/outfits/${id}`)}
        style={{ marginBottom: "16px" }}
      >
        Back to Outfit
      </Button>

      <Card
        className="edit-outfit-card"
        title={
          <div className="card-title">
            <span>Edit Outfit</span>
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
            rules={[{ required: true, message: "Please enter outfit name!" }]}
          >
            <Input placeholder="e.g., Summer Casual" size="large" />
          </Form.Item>

          <Form.Item label="Current Image">
            {outfit?.image_url ? (
              <Image
                src={outfit.image_url}
                alt={outfit.name}
                style={{ maxWidth: "200px", borderRadius: "8px" }}
              />
            ) : (
              <p style={{ color: "#999" }}>No image uploaded</p>
            )}
          </Form.Item>

          <Form.Item label="Upload New Image (optional)">
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
            <p style={{ color: "#999", fontSize: "12px", marginTop: "8px" }}>
              Upload a new image to replace the current one
            </p>
          </Form.Item>

          <Form.Item className="form-actions">
            <Button
              type="default"
              size="large"
              onClick={() => navigate(`/outfits/${id}`)}
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
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditOutfitPage;
