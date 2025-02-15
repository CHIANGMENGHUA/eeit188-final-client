<template>
    <v-sheet
        class="position-fixed w-100"
        style="z-index: 100; padding-top: 30px"
        color="transparent"
    >
        <SearchHouseBar />
    </v-sheet>
    <v-fab
        :active="infinityScrollOffsetTop > 30"
        location="bottom end"
        icon="mdi-chevron-up"
        class="me-4 mb-4"
        color="brown"
        size="48"
        app
        appear
        @click.stop="onClickScrollTop"
    ></v-fab>
    <v-container :style="{ paddingTop: `100px` }" >
        <v-infinite-scroll
            v-if="renderInfinityScrollComponent"
            :items="filterHouseList"
            @load="loadFilterHouse"
        >
            <template v-for="(item, index) in filterHouseList" :key="index">
                <!-- List view -->
                <v-sheet
                    class="d-flex align-center justify-center border mb-5 elevation-0 search-item"
                    color="brown-lighten-5"
                    rounded="xl"
                >
                    <v-row class="fill-height" no-gutters>
                        <v-col class="pa-5" cols="12" sm="5" md="4" lg="3" xl="3">
                            <!-- 圖片 -->
                            <v-sheet color="transparent" rounded="lg" class="overflow-hidden">
                                <v-carousel
                                    height="200"
                                    show-arrows="hover"
                                    hide-delimiter-background
                                    hide-delimiters
                                >
                                    <template v-slot:prev="{ props }">
                                        <v-btn
                                            v-if="item.houseExternalResourceRecords.length > 1"
                                            :class="props.class"
                                            color="rgba(255,255,255,0.5)"
                                            size="small"
                                            density="compact"
                                            icon="mdi-chevron-left"
                                            variant="elevated"
                                            @click="props.onClick"
                                        ></v-btn>
                                    </template>
                                    <template v-slot:next="{ props }">
                                        <v-btn
                                            v-if="item.houseExternalResourceRecords.length > 1"
                                            :class="props.class"
                                            color="rgba(255,255,255,0.5)"
                                            size="small"
                                            density="compact"
                                            icon="mdi-chevron-right"
                                            variant="elevated"
                                            @click="props.onClick"
                                        ></v-btn>
                                    </template>
                                    <v-carousel-item
                                        v-for="imageSrc in houseSearchStore.getHouseImageUrlList(
                                            item.houseExternalResourceRecords
                                        )"
                                    >
                                        <v-img
                                            :aspect-ratio="1"
                                            :height="200"
                                            :src="imageSrc"
                                            cover
                                        ></v-img>
                                    </v-carousel-item>
                                </v-carousel>
                            </v-sheet>
                        </v-col>
                        <v-col
                            class="d-flex justify-start align-start pa-5"
                            cols="12"
                            sm="7"
                            md="8"
                            lg="9"
                            xl="9"
                        >
                            <div class="d-flex flex-row mb-6 w-100 h-100">
                                <!-- 房源名稱與資訊 -->
                                <v-sheet class="flex-grow-1" color="transparent">
                                    <div
                                        class="text-h5 font-weight-medium text-brown-darken-4 pt-1 mb-1"
                                    >
                                        {{ item.name }}
                                    </div>
                                    <div class="text-grey-darken-1">
                                        <span class="mdi mdi-map-marker mr-2"></span>
                                        <span class="mr-2">{{
                                            `位於 ${item.city} ${item.region}`
                                        }}</span>
                                    </div>
                                    <div class="text-grey-darken-1">
                                        <span class="mdi mdi-sofa mr-2"></span>
                                        <span class="mr-1" v-if="item.livingDiningRoom > 0">
                                            {{ `${item.livingDiningRoom} 廳` }}
                                        </span>
                                        <span class="mr-1" v-if="item.bedroom > 0">
                                            {{ `${item.bedroom} 房` }}
                                        </span>
                                        <span class="mr-1" v-if="item.bathroom > 0">
                                            {{ `${item.bathroom} 淋浴` }}
                                        </span>
                                        <span class="mr-1" v-if="item.restroom > 0">
                                            {{ `${item.restroom} 衛生` }}
                                        </span>
                                    </div>
                                    <div class="text-grey-darken-1">
                                        <span class="mdi mdi-bed mr-2"></span>
                                        <span>可住 </span>
                                        <span class="mr-1" v-if="item.adult > 0">
                                            {{ `${item.adult} 位成人 ` }}
                                        </span>
                                        <span class="mr-1" v-if="item.child > 0">
                                            {{ `${item.child} 位孩童 ` }}
                                        </span>
                                    </div>
                                    <div class="text-grey-darken-1">
                                        <span class="mr-2" v-if="!item.pet">
                                            <span class="mdi mdi-paw-off mr-2"></span>
                                            <span>禁止寵物</span>
                                        </span>

                                        <span class="mr-2" v-if="!item.smoke">
                                            <span class="mdi mdi-smoking-off mr-2"></span>
                                            <span>禁止吸菸</span>
                                        </span>
                                    </div>
                                </v-sheet>
                                <!-- 價錢與詳細按鈕 -->
                                <v-sheet
                                    class="d-flex flex-column flex-grow-1 justify-end align-end"
                                    color="transparent"
                                >
                                    <v-sheet color="transparent">
                                        <div
                                            class="text-h5 font-weight-medium text-brown-darken-4 mb-2 mr-1"
                                        >
                                            NT ${{ item.price }}
                                        </div>
                                    </v-sheet>
                                    <v-sheet color="transparent">
                                        <v-btn
                                            color="brown-lighten-1"
                                            min-width="130"
                                            size="large"
                                            :to="`/house/${item.id}`"
                                            >詳細資訊</v-btn
                                        >
                                    </v-sheet>
                                </v-sheet>
                            </div>
                        </v-col>
                    </v-row>
                </v-sheet>
            </template>
            <template v-slot:empty>
                <v-sheet>
                    <v-alert variant="plain"
                        >房源搜尋完畢! 共找到 {{ filterHouseList.length }} 個相符房源</v-alert
                    >
                </v-sheet>
            </template>
        </v-infinite-scroll>
    </v-container>
</template>

<script setup>
import SearchHouseBar from "@/components/home/SearchHouseBar.vue";
import { ref } from "vue";
import { useHouseSearchStore } from "@/stores/houseSearchStore";
import { storeToRefs } from "pinia";

const houseSearchStore = useHouseSearchStore();
const { renderInfinityScrollComponent, currentFilterHousePage, filterHouseList } =
    storeToRefs(houseSearchStore);

const infinityScrollOffsetTop = ref(0);

async function loadFilterHouse({ done }) {
    console.log("Infinity scroll get data...");
    let data = await houseSearchStore.getFilterHouse();
    if (data != null) {
        if (!data.empty) {
            filterHouseList.value.push(...data.content);
            currentFilterHousePage.value++;
            console.log(`Read house list ok! Page: ${currentFilterHousePage.value}`);
            done("ok");
        } else {
            console.log(`Read house list empty! Page: ${currentFilterHousePage.value}`);
            done("empty");
        }
    } else {
        console.log(`Read house list error! Page: ${currentFilterHousePage.value}`);
        done("error");
    }
}

function onClickScrollTop() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
    });
}

function onScroll(e) {
    console.log("scrolling", e);
}
</script>
<style scoped>
:deep(.v-skeleton-loader > *) {
    margin: 0;
}

:deep(.v-skeleton-loader .v-skeleton-loader__image) {
    display: flex;
    flex-grow: 1;
    height: 100%;
    flex-direction: column;
}
</style>
