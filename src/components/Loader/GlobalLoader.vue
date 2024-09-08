<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { watch } from "vue";
import { useLoaderStore } from "@/composables/dashboard/LoaderStore";

const { isLoading } = useLoaderStore();

watch(
    () => isLoading.value,
    (nv) => console.log('isLoading', nv)
);
</script>

<template>
    <div v-if="isLoading" class="isLoading">
        <va-inner-loading va-inner-loading class="loader" :loading="isLoading" :size="100"></va-inner-loading>
    </div>
</template>
<style lang="scss" scoped>
.isLoading {
    position: fixed;
    // top: 0;
    // left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #d5cfcf80;
    z-index: 99999999;
}
</style>