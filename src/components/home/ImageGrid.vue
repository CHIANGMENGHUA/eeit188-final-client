<template>
    <!-- Images Grid -->
    <v-hover v-slot="{ isHovering, props }">
        <v-responsive :aspect-ratio="10 / 4" ref="imageBoxRef" class="mx-1" v-bind="props">
            <v-sheet class="fill-height d-flex flex-row ga-1 rounded-xl" style="contain: size" color="transparent">
                <v-sheet class="flex-grow-1 rounded-s-xl overflow-hidden" color="transparent">
                    <v-skeleton-loader
                        class="custom-skeleton-image"
                        type="image"
                        height="100%"
                        v-if="isLoading"
                    />
                    <v-img
                        :src="houseDetailStore.getHouseDetailImage(0)"
                        position="center"
                        :height="bigImageHeight"
                        cover
                        v-else
                    ></v-img>
                </v-sheet>
                <v-sheet class="flex-grow-1 d-flex flex-column ga-1" color="transparent">
                    <v-sheet class="flex-grow-1 d-flex flex-row ga-1" color="transparent">
                        <v-sheet class="flex-grow-1">
                            <v-skeleton-loader
                                type="image"
                                height="100%"
                                width="100%"
                                v-if="isLoading"
                            />
                            <v-img
                                :src="houseDetailStore.getHouseDetailImage(1)"
                                position="center"
                                cover
                                :height="smallImageHeight"
                                v-else
                            ></v-img>
                        </v-sheet>
                        <v-sheet class="flex-grow-1 rounded-te-xl overflow-hidden">
                            <v-skeleton-loader
                                v-if="isLoading"
                                type="image"
                                height="100%"
                                width="100%"
                            />
                            <v-img
                                v-else
                                :src="houseDetailStore.getHouseDetailImage(2)"
                                position="center"
                                :height="smallImageHeight"
                                cover
                            ></v-img>
                        </v-sheet>
                    </v-sheet>
                    <v-sheet class="flex-grow-1 d-flex flex-row ga-1" color="transparent">
                        <v-sheet class="flex-grow-1">
                            <v-skeleton-loader
                                type="image"
                                height="100%"
                                width="100%"
                                v-if="isLoading"
                            />
                            <v-img
                                :src="houseDetailStore.getHouseDetailImage(3)"
                                position="center"
                                :height="smallImageHeight"
                                cover
                                v-else
                            ></v-img>
                        </v-sheet>

                        <v-sheet class="flex-grow-1 rounded-be-xl overflow-hidden">
                            <v-skeleton-loader
                                type="image"
                                height="100%"
                                width="100%"
                                v-if="isLoading"
                            />
                            <v-img
                                v-else
                                :src="houseDetailStore.getHouseDetailImage(4)"
                                position="center"
                                :height="smallImageHeight"
                                cover
                            >
                                <v-overlay
                                    v-if="houseInfo.houseExternalResourceRecords.length > 5"
                                    :model-value="isHovering"
                                    class="align-center justify-center cursor-pointer text-center text-white"
                                    scrim="rgba(0,0,0,1)"
                                    contained
                                    @click.stop="onClickMorePhoto"
                                >
                                    <v-icon size="x-large" icon="mdi-image-multiple"></v-icon>
                                    <div class="font-weight-black">查看更多</div>
                                </v-overlay>
                            </v-img>
                        </v-sheet>
                    </v-sheet>
                </v-sheet>
            </v-sheet>
        </v-responsive>
    </v-hover>
    <MorePhotosDialog v-model="isOpenMorePhotosDialog" />
</template>
<script setup>
import { ref } from "vue";
import { useHouseDetailStore } from "../../stores/houseDetailStore";
import { storeToRefs } from "pinia";
import { useResizeObserver } from "@vueuse/core";
import MorePhotosDialog from "./MorePhotosDialog.vue";
// Use pinia store
const houseDetailStore = useHouseDetailStore();
const { isLoading, houseInfo } = storeToRefs(houseDetailStore);

// Detect image box v-responsive height
const imageBoxRef = ref(null);
const bigImageHeight = ref(1);
const smallImageHeight = ref(1);

const isOpenMorePhotosDialog = ref(false);
function onClickMorePhoto() {
    isOpenMorePhotosDialog.value = true;
    // console.log("asdasd");
    // document.activeElement.blur();
}

useResizeObserver(imageBoxRef, (entries) => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    // console.log(`Image box: width: ${width}, height: ${height}`);
    bigImageHeight.value = height;
    smallImageHeight.value = height / 2 - 2; // with gap width(4px / 2)
});
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
