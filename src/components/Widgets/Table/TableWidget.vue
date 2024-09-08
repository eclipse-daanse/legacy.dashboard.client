<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script lang="ts" setup>
import { parse } from "csv-parse/browser/esm/sync";
import { onMounted, ref, computed } from "vue";

const data = ref([]);
const headers = ref([]);

const filter = ref("");
const filterByFields = ref([]);

const currentPage = ref(0);
const perPage = ref(10);
const columns = ref([]);
const filteredItemsAmount = ref(0);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const request = await fetch(
    "https://raw.githubusercontent.com/dsindy/kaggle-titanic/master/data/test.csv",
  );
  const csvContent = await request.text();
  loading.value = false;

  headers.value = parse(csvContent)[0];
  columns.value = headers.value.map((header) => {
    return {
      key: header,
      sortable: true,
    };
  });

  data.value = [...parse(csvContent, { columns: true })];
  currentPage.value = 1;
  perPage.value = 10;
});

const pagesAmount = computed(() => {
  if (!perPage.value) return 1;
  return Math.ceil(filteredItemsAmount.value / perPage.value);
});

const customFilteringFn = (source, cellData) => {
  if (!filter.value) {
    return true;
  }

  if (filterByFields.value.length >= 1) {
    const searchInCurrentRow = filterByFields.value.some(
      (field) => cellData.column.key === field,
    );
    if (!searchInCurrentRow) return false;
  }

  const filterRegex = new RegExp(filter.value, "i");

  return filterRegex.test(source);
};
</script>
<template>
  <div class="table_container" v-if="!loading">
    <div class="filters">
      <VaInput v-model="filter" placeholder="Filter..." />
      <VaSelect
        v-model="filterByFields"
        placeholder="Select filter fields"
        :options="headers"
        value-by="value"
        multiple
      />
    </div>
    <Suspense>
      <va-data-table
        class="table"
        :items="data"
        sticky-header
        :per-page="-(-perPage)"
        :current-page="currentPage"
        :columns="columns"
        :filter="filter"
        :filter-method="customFilteringFn"
        @filtered="
          filteredItemsAmount = $event.items.length;
          currentPage = 1;
        "
      />
    </Suspense>
    <div class="pagination">
      <VaInput
        v-model="perPage"
        label="Items per page"
        class="page_input"
        type="number"
      />
      <VaPagination
        v-model="currentPage"
        :pages="pagesAmount"
        :visible-pages="5"
      />
    </div>
  </div>
  <div v-else="loading" class="loading">
    <va-inner-loading class="loader" :loading="loading" :size="55"></va-inner-loading>
  </div>
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  flex-grow: 0;
}

.table_container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table_container .pagination {
  flex-grow: 0;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-items: center;
  align-items: end;
}

.table_container .pagination .page_input {
  justify-self: start;
}

.table_container .table {
  flex-grow: 1;
  flex-shrink: 1;
}

.loading {
  display: flex;
  height: 100%;
}
</style>
