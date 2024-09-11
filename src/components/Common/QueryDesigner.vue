<script lang="ts" setup>
import { ref, type Ref } from "vue";
import MeasureSelectionModal from "@/components/Modals/MeasureSelectionModal.vue";
import AxisSelectionModal from "@/components/Modals/AxisSelectionModal.vue";
import FilterSelectionModal from "@/components/Modals/FilterSelectionModal.vue";
import { cloneDeep } from "lodash";

const measureSelectionModal = ref() as Ref<any>;
const axisSelectionModal = ref() as Ref<any>;
const filterSelectionModal = ref() as Ref<any>;

const props = defineProps({
    store: {
        type: Object,
        required: true,
    },
    currentState: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits([
    "update:measures",
    "update:rows",
    "update:cols",
    "update:filters",
]);

const openMeasureSelectionModal = async () => {
    const selectedMeasures = await measureSelectionModal.value.run({
        store: props.store,
        selectedMeasures: props.currentState.measures,
    });

    emit("update:measures", selectedMeasures);
};

const openAxisSelectionModal = async (axis) => {
    let currentSelection = null;

    if (axis === "rows") {
        currentSelection = props.currentState.rows;
    } else if (axis === "cols") {
        currentSelection = props.currentState.columns;
    } else if (axis === "filters") {
        currentSelection = props.currentState.filters;
    }

    const selectedHierarchies = await axisSelectionModal.value.run({
        store: props.store,
        selectedHierarchies: currentSelection,
    });

    if (axis === "rows") {
        emit("update:rows", selectedHierarchies);
    } else if (axis === "cols") {
        emit("update:cols", selectedHierarchies);
    } else if (axis === "filters") {
        emit("update:filters", selectedHierarchies);
    }
};

const removeMeasure = (measureUniqueName) => {
    const selectedMeasures = props.currentState.measures.filter(
        (measure) => measure.MEASURE_UNIQUE_NAME !== measureUniqueName,
    );

    emit("update:measures", selectedMeasures);
};

const removeFromAxis = (axis, hierarchyUniqueName) => {
    if (axis === "rows") {
        const selectedRows = props.currentState.rows.filter(
            (hierarchy) =>
                hierarchy.originalItem.HIERARCHY_UNIQUE_NAME !==
                hierarchyUniqueName,
        );

        emit("update:rows", selectedRows);
    } else if (axis === "cols") {
        const selectedCols = props.currentState.columns.filter(
            (hierarchy) =>
                hierarchy.originalItem.HIERARCHY_UNIQUE_NAME !==
                hierarchyUniqueName,
        );

        emit("update:cols", selectedCols);
    } else if (axis === "filters") {
        const selectedFilters = props.currentState.filters.filter(
            (hierarchy) =>
                hierarchy.originalItem.HIERARCHY_UNIQUE_NAME !==
                hierarchyUniqueName,
        );

        emit("update:filters", selectedFilters);
    }
};

const openFiltersModal = async (axis, id) => {
    if (axis === "rows") {
        const currentArea = cloneDeep(props.currentState.rows);
        const selectedHierarchy = currentArea.find(
            (hierarchy) => hierarchy.id === id,
        );

        const filtersCongig = await filterSelectionModal.value.run({
            store: props.store,
            element: selectedHierarchy,
        });

        if (selectedHierarchy) {
            selectedHierarchy.filters.enabled = filtersCongig.filters.enabled;
            selectedHierarchy.filters.multipleChoise =
                filtersCongig.filters.multipleChoise;
            selectedHierarchy.filters.selectedItems =
                filtersCongig.filters.selectedItems;
            selectedHierarchy.filters.deselectedItems =
                filtersCongig.filters.deselectedItems;
            selectedHierarchy.filters.originalItem =
                filtersCongig.filters.originalItem;
        }

        emit("update:rows", currentArea);
    } else if (axis === "cols") {
        const currentArea = cloneDeep(props.currentState.columns);

        const selectedHierarchy = currentArea.find(
            (hierarchy) => hierarchy.id === id,
        );

        const filtersCongig = await filterSelectionModal.value.run({
            store: props.store,
            element: selectedHierarchy,
        });

        if (selectedHierarchy) {
            selectedHierarchy.filters.enabled = filtersCongig.filters.enabled;
            selectedHierarchy.filters.multipleChoise =
                filtersCongig.filters.multipleChoise;
            selectedHierarchy.filters.selectedItems =
                filtersCongig.filters.selectedItems;
            selectedHierarchy.filters.deselectedItems =
                filtersCongig.filters.deselectedItems;
            selectedHierarchy.filters.originalItem =
                filtersCongig.filters.originalItem;
        }

        emit("update:cols", currentArea);
    } else if (axis === "filters") {
        const currentArea = cloneDeep(props.currentState.filters);
        const selectedHierarchy = currentArea.find(
            (hierarchy) => hierarchy.id === id,
        );

        const filtersCongig = await filterSelectionModal.value.run({
            store: props.store,
            element: selectedHierarchy,
        });

        if (selectedHierarchy) {
            selectedHierarchy.filters.enabled = filtersCongig.filters.enabled;
            selectedHierarchy.filters.multipleChoise =
                filtersCongig.filters.multipleChoise;
            selectedHierarchy.filters.selectedItems =
                filtersCongig.filters.selectedItems;
            selectedHierarchy.filters.deselectedItems =
                filtersCongig.filters.deselectedItems;
            selectedHierarchy.filters.originalItem =
                filtersCongig.filters.originalItem;
        }

        emit("update:filters", currentArea);
    }
};
</script>
<template>
    <div class="store_list-item-query_designer">
        <div>
            <div class="query_designer-area-header">
                <div>Filters</div>
                <VaButton
                    icon="add"
                    preset="secondary"
                    round
                    @click="openAxisSelectionModal('filters')"
                />
            </div>
            <div class="query_designer-area">
                <div
                    v-for="item in currentState.filters"
                    :key="item.id"
                    class="query_designer-area-item"
                >
                    <div>
                        {{ item.caption }}
                    </div>
                    <VaButton
                        icon="filter_list"
                        preset="secondary"
                        round
                        :color="item.filters.enabled ? '#4CAF50' : ''"
                        @click="openFiltersModal('filters', item.id)"
                    />
                    <VaButton
                        icon="remove"
                        preset="secondary"
                        round
                        @click="removeFromAxis('filters', item.id)"
                    />
                </div>
            </div>
        </div>
        <div>
            <div class="query_designer-area-header">
                <div>Rows</div>
                <VaButton
                    icon="add"
                    preset="secondary"
                    round
                    @click="openAxisSelectionModal('rows')"
                />
            </div>
            <div class="query_designer-area">
                <div
                    v-for="item in currentState.rows"
                    :key="item.id"
                    class="query_designer-area-item"
                >
                    <div>
                        {{ item.caption }}
                    </div>
                    <VaButton
                        icon="filter_list"
                        preset="secondary"
                        round
                        :color="item.filters.enabled ? '#4CAF50' : ''"
                        @click="openFiltersModal('rows', item.id)"
                    />
                    <VaButton
                        icon="remove"
                        preset="secondary"
                        round
                        @click="removeFromAxis('rows', item.id)"
                    />
                </div>
            </div>
        </div>
        <div>
            <div class="query_designer-area-header">
                <div>Columns</div>
                <VaButton
                    icon="add"
                    preset="secondary"
                    round
                    @click="openAxisSelectionModal('cols')"
                />
            </div>
            <div class="query_designer-area">
                <div
                    v-for="item in currentState.columns"
                    :key="item.id"
                    class="query_designer-area-item"
                >
                    <div>
                        {{ item.caption }}
                    </div>
                    <VaButton
                        icon="filter_list"
                        preset="secondary"
                        round
                        :color="item.filters.enabled ? '#4CAF50' : ''"
                        @click="openFiltersModal('cols', item.id)"
                    />
                    <VaButton
                        icon="remove"
                        preset="secondary"
                        round
                        @click="removeFromAxis('cols', item.id)"
                    />
                </div>
            </div>
        </div>
        <div>
            <div class="query_designer-area-header">
                <div>Measures</div>
                <VaButton
                    icon="add"
                    preset="secondary"
                    round
                    @click="openMeasureSelectionModal()"
                />
            </div>
            <div class="query_designer-area">
                <div
                    v-for="measure in currentState.measures"
                    :key="measure.MEASURE_UNIQUE_NAME"
                    class="query_designer-area-item"
                >
                    <div>
                        {{ measure.MEASURE_NAME }}
                    </div>
                    <VaButton
                        icon="remove"
                        preset="secondary"
                        round
                        @click="removeMeasure(measure.MEASURE_UNIQUE_NAME)"
                    />
                </div>
            </div>
        </div>

        <Teleport to="body">
            <MeasureSelectionModal ref="measureSelectionModal" />
            <AxisSelectionModal ref="axisSelectionModal" />
            <FilterSelectionModal ref="filterSelectionModal" />
        </Teleport>
    </div>
</template>
<style>
.store_list-item-query_designer {
    border-top: 1px solid lightgrey;
    margin: 0.25rem -0.25rem 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0.5rem;
    gap: 0.5rem;
}

.query_designer-area {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px dashed lightgrey;
    height: 200px;
    padding: 0.5rem;
    overflow: auto;
}

.query_designer-area-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: 1px solid lightgrey;
    border-radius: 2px;
    padding: 0.25rem;
    padding-left: 0.5rem;
}

.query_designer-area-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-left: 0.5rem;
}
</style>
