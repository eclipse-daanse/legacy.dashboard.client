<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
export interface IImageSettingsProps {
    imagesSettings?: GallerySettings;
    images?: ImageGalleryItem[];
}

import { onMounted, ref, watch, type Ref, computed, inject } from "vue";
import { useSettings } from "@/composables/widgets/settings";
import { useStore } from "@/composables/widgets/store";
import { useSerialization } from "@/composables/widgets/serialization";
import type { Store } from "@/stores/Widgets/Store";
import type { ImageGalleryItem, GallerySettings } from "@/@types/widgets";
import ImageWidgetSettings from "./ImageWidgetSettings.vue";
import type { TinyEmitter } from "tiny-emitter";

const settingsComponent = ImageWidgetSettings;

const props = withDefaults(defineProps<IImageSettingsProps>(), {
    imagesSettings: () => ({
        fit: "None",
        diashowInterval: 0,
    }),
    images: (): ImageGalleryItem[] => [],
});

const eventbus = inject("customEventBus") as TinyEmitter;
const { settings, setSetting } = useSettings<typeof props>(props);
const { store, data, setStore, loading } = useStore<Store>(eventbus);
const { getState } = useSerialization(settings);

let interval = null as any;
const currentImage: Ref<number> = ref(0);

const toNext = () => {
    if (currentImage.value < settings.value.images.length - 1) {
        currentImage.value++;
    }
};

const toPrev = () => {
    if (currentImage.value > 0) {
        currentImage.value--;
    }
};

const initInterval = () => {
    if (interval) {
        clearInterval(interval);
    }
    if (settings.value.imagesSettings.diashowInterval > 0) {
        interval = setInterval(() => {
            if (currentImage.value === settings.value.images.length - 1) {
                currentImage.value = 0;
                return;
            }
            toNext();
        }, settings.value.imagesSettings.diashowInterval * 1000);
    }
};

onMounted(() => {
    initInterval();
});

watch(() => settings.value.imagesSettings.diashowInterval, initInterval);

defineExpose({
    setSetting,
    settings,
    settingsComponent,
    getState,
    store,
    setStore,
    loading,
});

const parsedUrl = (url: string): string => {
    const regex = /{(.*?)}/g;
    const parts = url?.match(regex);

    if (!parts || !data.value) {
        return url;
    }

    let parsedUrl = url;

    parts.forEach((element: string) => {
        const trimmedString = element.replace("{", "").replace("}", "");
        const dataField = trimmedString.split(".");
        let res = data.value;

        for (const field of dataField) {
            res = res[field];
        }
        parsedUrl = parsedUrl.replace(element, String(res));
    });
    return parsedUrl;
};

watch(
    () => settings.value.images.length,
    (newLength, oldLength) => {
        if (oldLength > newLength) {
            if (currentImage.value >= newLength) {
                currentImage.value = newLength - 1;
            }
        }
    },
);

const lastImageIndex = computed(() => {
    return settings.value.images.length > 0
        ? settings.value.images.length - 1
        : 0;
});

watch(lastImageIndex, () => {
    currentImage.value = lastImageIndex.value;
});
</script>

<template>
    <template v-if="settings.images.length <= 1">
        <img class="image" :src="parsedUrl(settings.images[0]?.url)" />
    </template>
    <template v-else>
        <div class="galery-container">
            <div class="button-prev">
                <va-button
                    @click="toPrev()"
                    icon="chevron_left"
                    preset="plain"
                    text-color="#ffffff"
                    :disabled="currentImage === 0"
                ></va-button>
            </div>
            <div
                class="galery-viewport"
                :style="`transform: translateX(-${100 * currentImage}%)`"
            >
                <div
                    v-for="(image, i) in settings.images"
                    :key="image.id"
                    class="galery-image"
                    :style="`transform: translateX(${100 * i}%)`"
                >
                    <!-- {{ image.url }} -->
                    <img class="image" :src="parsedUrl(image.url)" />
                </div>
            </div>

            <div class="button-next">
                <va-button
                    @click="toNext()"
                    icon="chevron_right"
                    text-color="#ffffff"
                    :disabled="currentImage === settings.images.length - 1"
                    preset="plain"
                ></va-button>
            </div>
        </div>
    </template>
</template>

<style scoped>
.image {
    width: 100%;
    height: 100%;
    object-fit: v-bind(settings.imagesSettings.fit);
}

.galery-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.galery-container .galery-viewport {
    width: 100%;
    height: 100%;
    overflow: visible;
    position: relative;
    transition: transform 0.3s ease-in-out;
}

.galery-container .galery-image {
    width: 100%;
    height: 100%;
    position: absolute;
}

.button-prev {
    left: 10px;
}

.button-next,
.button-prev {
    position: absolute;
    top: 50%;
    width: 2rem;
    height: 2rem;
    transform: translateY(-50%);
    z-index: 1;
    background-color: #000000a0;
    border-radius: 10000px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.button-next {
    right: 10px;
}
</style>
