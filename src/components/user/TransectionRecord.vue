<template>
  <div class="record-container" @scroll="handleScroll">
    <v-card v-if="ticket?.tickets.length === 0" class="mx-auto mb-5" subtitle="您目前沒有任何交易紀錄" width="600"
      height="50"></v-card>
    <v-card v-for="t in ticket?.tickets" :key="t" class="mx-auto mb-5 custom-card" color="grey-lighten-3" width="700"
      min-height="150">
      <div class="content">
        <v-card-subtitle class="custom-subtitle pa-0">{{
          t.house.name
        }}</v-card-subtitle>
        <v-img class="main-img" width="100" :src="fetchImage(t)" @click="handleClick(t)"></v-img>
      </div>
      <div class="info">
        <v-text>支付新台幣 {{ t?.transactionRecord.cashFlow }} 元</v-text>
        <v-text>下訂時間：{{ formatDate(t?.transactionRecord.createdAt) }}</v-text>
        <v-text>已預定：{{ formatDate(t?.startedAt).split(' ')[0] }} ~ {{ formatDate(t?.endedAt).split(' ')[0] }}</v-text>
      </div>
      <v-card class="deal" v-if="t?.transactionRecord.deal === '確認付款中'" color="warning">
        <v-text>{{ t?.transactionRecord.deal }}</v-text>
      </v-card>
      <v-card class="deal" v-if="t?.transactionRecord.deal === '付款成功'" color="success">
        <v-text>{{ t?.transactionRecord.deal }}</v-text>
      </v-card>
      <v-card class="deal" v-if="t?.transactionRecord.deal === '取消訂單'" color="error">
        <v-text>{{ t?.transactionRecord.deal }}</v-text>
      </v-card>
      <v-btn v-if="t?.transactionRecord.deal === '付款成功'" class="btn" @click="openQrCode(t)">QR CODE</v-btn>
    </v-card>
    <div v-if="hasMore && ticket?.tickets.length >= 5" class="loader"></div>
    <v-text class="bottom-text" v-if="!hasMore && ticket?.tickets.length !== 0">已經到底囉～</v-text>
  </div>
  <v-dialog class="ticket-dialog" v-model="dialog" width="auto">
    <v-card class="ticket-card" max-width="400">
      <v-text class="ticket-text" id="ticket-text-title">您的QR CODE</v-text>
      <v-text class="ticket-text">編號： {{ currentTicket.id }}</v-text>
      <v-card v-if="new Date(currentTicket.startedAt) > new Date()" class="ticket-status" color="warning">
        <v-text id="ticket-text-check">非有效時間</v-text>
      </v-card>
      <v-card v-if="
        used === '已入住' &&
        new Date(currentTicket.startedAt) <= new Date() &&
        new Date(currentTicket.endedAt) >= new Date()
      " class="ticket-status" color="success">
        <v-text id="ticket-text-check">{{ used }}</v-text>
      </v-card>
      <v-card v-if="
        used === '未入住' &&
        new Date(currentTicket.startedAt) <= new Date() &&
        new Date(currentTicket.endedAt) >= new Date()
      " class="ticket-status" color="grey-lighten-2" width="100">
        <v-text id="ticket-text-check">{{ used }}</v-text>
      </v-card>
      <v-card v-if="new Date(currentTicket.endedAt) < new Date()" class="ticket-status" color="error" width="100">
        <v-text id="ticket-text-check">票券已過期</v-text>
      </v-card>
      <img :src="qrCode" width="300" alt="QR Code" />
      <template v-slot:actions>
        <v-btn class="ms-auto" text="Ok" @click="dialog = false"></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "../../stores/userStore";
import notFoundImg from "@/assets/ImageNotAvailable02.webp";
import api from "@/plugins/axios";
import QRCode from "qrcode";

const userStore = useUserStore();
const { user } = userStore;

const ticket = reactive({
  tickets: [],
});

const qrCode = ref(null);
const currentTicket = ref(null);
const used = ref(null);
const page = ref(0);
const isFetching = ref(false);
const hasMore = ref(true);
const dialog = ref(false);

onMounted(() => {
  fetchTickets();
});

async function fetchTickets() {
  if (isFetching.value || !hasMore.value) return;
  isFetching.value = true;

  try {
    const response = await api({
      method: "post",
      url: "/ticket/find-condition",
      data: {
        userId: user.id,
        pageNum: page.value,
        pageSize: 10,
        orderBy: "createdAt",
        desc: false,
      },
    });

    const fatchedTickets = response.data.content;

    if (fatchedTickets.length > 0) {
      console.log(fatchedTickets);
      ticket.tickets.push(
        ...fatchedTickets.filter((obj) => obj.transactionRecord != null)
      );
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.log(error);
  } finally {
    isFetching.value = false;
  }
}

const fetchImage = (t) => {
  if (t.house.houseExternalResourceRecords[0]) {
    return (
      import.meta.env.VITE_API_URL +
      `/house-external-resource/image/${t.house.houseExternalResourceRecords[0].id}`
    );
  } else {
    return notFoundImg;
  }
};

const handleClick = (t) => {
  const url = `/house/${t.house.id}`;
  window.open(url, "_blank");
};

const openQrCode = (t) => {
  currentTicket.value = t;

  QRCode.toDataURL(t.id)
    .then((url) => {
      qrCode.value = url;
    })
    .catch((err) => {
      console.error(err);
    });

  if (t.used) {
    used.value = "已入住";
  } else {
    used.value = "未入住";
  }

  dialog.value = true;
};

function handleScroll(event) {
  const container = event.target;

  // Check if scrolled to bottom
  if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
    loadNextPage();
  }
}

async function loadNextPage() {
  if (isFetching.value || !hasMore.value) return;

  page.value++; // Increment the page

  await fetchTickets();
}

// Date formatting function
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Intl.DateTimeFormat("zh-TW", options).format(new Date(dateString));
};
</script>

<style scoped>
.record-container {
  width: 700px;
  height: 700px;
  max-height: 700px;
  overflow-y: auto;
}

.content {
  position: absolute;
  left: 20px;
  top: 10px;
}

.custom-card {
  display: flex;
  align-items: center;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: first baseline;
  margin-left: 150px;
  margin-right: auto;
  margin-top: auto;
  margin-bottom: auto;
}

.custom-subtitle {
  left: 20px;
  font-size: 20px;
  font-weight: bold;
}

.deal {
  margin-right: 30px;
  padding: 5px;
}

.main-img {
  cursor: pointer;
}

.loader {
  margin-left: auto;
  margin-right: auto;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.bottom-text {
  margin-left: 50%;
}

.btn {
  margin-right: 30px;
}

.ticket-text {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
}

.ticket-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

#ticket-text-title {
  font-size: 30px;
}

#ticket-text-check {
  font-size: 30px;
}

.ticket-status {
  padding: 5px;
  text-align: center;
}
</style>
