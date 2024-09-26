import { defineStore } from "pinia";
import api from "@/plugins/axios";
import { ref, reactive } from "vue";

export const useHostManagementStore = defineStore(
  "hostManagement",
  () => {
    // 狀態
    const properties = ref([]); // 房源
    const reviews = ref([]);    // 評價
    const orders = ref([]);     // 訂單
    const selectedProperty = ref(null);  // 當前選中的房源
    const selectedReview = ref(null);    // 當前選中的評價

    // 方法

    // 1. 獲取所有房源，對應於 HouseController 的 API
    async function fetchProperties() {
      try {
        const response = await api.get("/houses"); // 假設路徑
        properties.value = response.data;
      } catch (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
    }

    // 2. 添加房源，對應於 HouseController 的 API
    async function addProperty(propertyData) {
      try {
        const response = await api.post("/houses", propertyData); // 假設路徑
        properties.value.push(response.data);
      } catch (error) {
        console.error("Error adding property:", error);
        throw error;
      }
    }

    // 3. 更新房源，對應於 HouseController 的 API
    async function updateProperty(propertyId, propertyData) {
      try {
        const response = await api.put(`/houses/${propertyId}`, propertyData); // 假設路徑
        const index = properties.value.findIndex((p) => p.id === propertyId);
        if (index !== -1) {
          properties.value[index] = { ...properties.value[index], ...propertyData };
        }
      } catch (error) {
        console.error("Error updating property:", error);
        throw error;
      }
    }

    // 4. 刪除房源，對應於 HouseController 的 API
    async function deleteProperty(propertyId) {
      try {
        await api.delete(`/houses/${propertyId}`); // 假設路徑
        properties.value = properties.value.filter((p) => p.id !== propertyId);
      } catch (error) {
        console.error("Error deleting property:", error);
        throw error;
      }
    }

    // 5. 獲取訂單，對應於 TranscationRecordController 的 API
    async function fetchOrders() {
      try {
        const response = await api.get("/transactions"); // 假設路徑
        orders.value = response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
    }

    // 6. 獲取特定房源的評價，對應於 HouseController 的 API
    async function fetchReviews(propertyId) {
      try {
        const response = await api.get(`/houses/${propertyId}/reviews`); // 假設路徑
        reviews.value = response.data;
      } catch (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }
    }

    // 7. 上傳房源圖片，對應於 HouseExternalResourceController 的 API
    async function uploadPropertyImage(propertyId, file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        await api.post(`/houses/${propertyId}/images`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.error("Error uploading property image:", error);
        throw error;
      }
    }

    // 8. 獲取房源背景圖片，對應於 HouseExternalResourceController 的 API
    async function fetchPropertyBackgroundImage(propertyId) {
      try {
        const response = await api.get(`/houses/${propertyId}/background`, {
          responseType: "blob",
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    }

    // 9. 從 MongoDB 獲取房源資料，對應於 HouseMongoController 的 API
    async function fetchMongoProperty(propertyId) {
      try {
        const response = await api.get(`/houses/mongo/${propertyId}`); // 假設路徑
        selectedProperty.value = response.data;
      } catch (error) {
        console.error("Error fetching MongoDB property:", error);
        throw error;
      }
    }

    return {
      properties,
      reviews,
      orders,
      selectedProperty,
      selectedReview,
      fetchProperties,
      addProperty,
      updateProperty,
      deleteProperty,
      fetchOrders,
      fetchReviews,
      uploadPropertyImage,
      fetchPropertyBackgroundImage,
      fetchMongoProperty,
    };
  },
  {
    persist: true,
  }
);


