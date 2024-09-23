import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import api from "../plugins/axios";
import { useRouter } from "vue-router";
import { useUserStore } from "./userStore";
import NotAvailableImage from "@/assets/ImageNotAvailable01.webp";

const initialHouseInfo = {
    id: null,
    name: null,
    category: null,
    information: null,
    latitudeX: null,
    longitudeY: null,
    country: null,
    city: null,
    region: null,
    address: null,
    price: null,
    pricePerDay: null,
    pricePerWeek: null,
    pricePerMonth: null,
    livingDiningRoom: null,
    bedroom: null,
    restroom: null,
    bathroom: null,
    adult: null,
    child: null,
    pet: null,
    smoke: null,
    kitchen: null,
    balcony: null,
    createdAt: null,
    updatedAt: null,
    priceRanges: null,
    postulates: null,
    tickets: null,
    collectionCount: null,
    userId: null,
    userName: null,
    houseExternalResourceRecords: [],
};

const initialHostInfo = {
    id: null,
    name: null,
    role: null,
    gender: null,
    birthday: null,
    phone: null,
    mobilePhone: null,
    address: null,
    email: null,
    about: null,
    createdAt: null,
    updatedAt: null,
    avatarBase64: null,
};

const initialSelfHouseDiscuss = {
    id: null,
    discuss: null,
    userId: null,
    user: null,
    houseId: null,
    house: null,
    avatar: null,
    score: null,
};

const userStore = useUserStore();
export const useHouseDetailStore = defineStore("HouseDetail", () => {
    const houseInfo = reactive({ ...initialHouseInfo });
    const hostInfo = reactive({ ...initialHostInfo });
    const selfHouseDiscuss = reactive({ ...initialSelfHouseDiscuss });
    const previewDiscussList = reactive([]);
    const discussList = reactive([]);
    const currentDiscussPage = ref(0);
    const isErrorGetHouseInfo = ref(false);
    const isLoading = ref(true);
    const isLoadingCollection = ref(false);
    const isCollected = ref(false);
    const isShareDialogOpen = ref(false);
    const isDiscussDialogOpen = ref(false);

    function resetHouseInfo() {
        Object.assign(houseInfo, initialHouseInfo);
    }

    function getHouseDetailImage(index) {
        const records = houseInfo.houseExternalResourceRecords;
        // Sort records by createdAt culomn
        records.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        let imageBaseUrl = import.meta.env.VITE_API_URL + "/house-external-resource/image/";
        let imageSrc = null;
        if (
            typeof records === "undefined" ||
            typeof records[index] === "undefined" ||
            records[index] === null ||
            records[index] === ""
        ) {
            imageSrc = NotAvailableImage;
        } else {
            imageSrc = imageBaseUrl + records[index].id;
        }
        return imageSrc;
    }

    async function getHouseInfo(id) {
        isLoading.value = true;
        await api
            .get(`/house/${id}`)
            .then((res) => {
                Object.assign(houseInfo, res.data);
                isErrorGetHouseInfo.value = false;
                isLoading.value = false;
                console.log("Get houseInfo from database sucessed!");
                checkIsCollectedHouse();
                checkIsDiscussHouse();
                getHostInfo();
                getPreviewDiscussList();
                getSelfHouseDiscuss();
            })
            .catch((err) => {
                Object.assign(houseInfo, initialHouseInfo);
                isErrorGetHouseInfo.value = true;
                isLoading.value = false;
                console.log("Get houseInfo from database failed! Take you to home page!");
            });
    }

    async function getHostInfo() {
        await api
            .get(`/user/find/${houseInfo.userId}`)
            .then((res) => {
                console.log("Get host avater success");
                Object.assign(hostInfo, res.data);
            })
            .catch((err) => {
                Object.assign(hostInfo, initialHostInfo);
                console.log("Get host avater failed");
            });
    }

    async function getPreviewDiscussList() {
        await api
            .get(`/discuss/house/${houseInfo.id}`, { params: { pageNo: 0, pageSize: 4 } })
            .then((res) => {
                console.log("Get preview discuss success");
                previewDiscussList.splice(0, previewDiscussList.length);
                previewDiscussList.push(...res.data.discusses);
            })
            .catch((err) => {
                console.log("Get preview discuss failed");
            });
    }

    async function getHouseDiscuss() {
        let data = null;
        await api
            .get(`/discuss/house/${houseInfo.id}`)
            .then((res) => {
                console.log("Get house discuss success");
                data = res.data;
            })
            .catch((err) => {
                // Object.assign(houseDiscuss, initialHuseDiscuss);
                console.log("Get host avater failed");
            });

        return data;
    }

    async function getSelfHouseDiscuss() {
        if (typeof userStore.user.id !== "undefined") {
            await api
                .get(`/discuss/user/${userStore.user.id}/${houseInfo.id}`)
                .then((res) => {
                    console.log("取得自己的評論成功", res.data.discuss, res.data.score);
                    Object.assign(selfHouseDiscuss, res.data);
                })
                .catch((err) => {
                    Object.assign(selfHouseDiscuss, initialSelfHouseDiscuss);
                    console.log("取得自己的評論失敗，你沒有評論");
                });
        }
    }

    async function writeSelfHouseDiscuss() {}

    async function addHouseToCollection() {
        isLoadingCollection.value = true;
        if (typeof userStore.user.id !== "undefined") {
            await api
                .post("/user-collection/", {
                    userId: userStore.user.id,
                    houseId: houseInfo.id,
                })
                .then((res) => {
                    console.log("Add house to collection success.", res);
                    isCollected.value = true;
                    isLoadingCollection.value = false;
                })
                .catch((err) => {
                    console.log("Add house to collection failed.");
                    isLoadingCollection.value = false;
                });
        } else {
            console.log("You are not login! can't collect house.");
        }
    }

    async function removeHouseToCollection() {
        isLoadingCollection.value = true;
        if (typeof userStore.user.id !== "undefined") {
            await api
                .post("/user-collection/delete", {
                    userId: userStore.user.id,
                    houseId: houseInfo.id,
                })
                .then((res) => {
                    console.log("Remove house to collection success.", res);
                    isCollected.value = false;
                    isLoadingCollection.value = false;
                })
                .catch((err) => {
                    console.log("Remove house to collection failed.");
                    isLoadingCollection.value = false;
                });
        } else {
            console.log("You are not login! can't collect house.");
        }
    }

    async function checkIsCollectedHouse() {
        isLoadingCollection.value = true;
        if (typeof userStore.user.id !== "undefined") {
            await api
                .get("/user-collection/", {
                    params: {
                        userId: userStore.user.id,
                        houseId: houseInfo.id,
                    },
                })
                .then((res) => {
                    console.log("Check house collection success.");
                    if (res.data.isCollected) {
                        isCollected.value = true;
                    } else {
                        isCollected.value = false;
                    }
                    isLoadingCollection.value = false;
                })
                .catch((err) => {
                    console.log("Check house collection failed.");
                    isLoadingCollection.value = true;
                });
        } else {
            console.log("You are not login! can't check collection.");
        }
    }

    async function checkIsDiscussHouse() {
        if (typeof userStore.user.id !== "undefined") {
            await api
                .get(`/house/mongo/find/${userStore.user.id}/${houseInfo.id}`)
                .then((res) => {
                    console.log("Check house disscess success.");
                    // if (res.data.isCollected) {
                    //     isCollected.value = true;
                    // } else {
                    //     isCollected.value = false;
                    // }
                    // isLoadingCollection.value = false;
                    // console.log(res.data);
                })
                .catch((err) => {
                    console.log("Check house collection failed.");
                    // isLoadingCollection.value = true;
                });
        } else {
            console.log("You are not login! can't check discuss.");
        }
    }

    return {
        houseInfo,
        hostInfo,
        selfHouseDiscuss,
        discussList,
        previewDiscussList,
        currentDiscussPage,
        isErrorGetHouseInfo,
        isLoading,
        isLoadingCollection,
        isCollected,
        isShareDialogOpen,
        isDiscussDialogOpen,
        resetHouseInfo,
        getHouseDetailImage,
        getHouseInfo,
        getPreviewDiscussList,
        getHouseDiscuss,
        getSelfHouseDiscuss,
        addHouseToCollection,
        removeHouseToCollection,
        checkIsCollectedHouse,
        checkIsDiscussHouse,
    };
});
