<!--
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

-->
<script setup lang="ts">
import GlobalLoader from "@/components/Loader/GlobalLoader.vue";
</script>

<template>
    <div class="sidebar">
        <va-sidebar hoverable minimized-width="55px" class="colored-sidebar">
            <va-sidebar-item
                :active="$route.name === 'designer'"
                @click="$router.push('/')"
                class="pointer"
            >
                <va-sidebar-item-content>
                    <va-icon name="draw" />
                    <va-sidebar-item-title>
                        {{ $t("DashboardNavigation.designer") }}
                    </va-sidebar-item-title>
                </va-sidebar-item-content>
            </va-sidebar-item>
            <va-sidebar-item
                :active="$route.name === 'dashboard'"
                @click="$router.push('/dashboard')"
                class="pointer"
            >
                <va-sidebar-item-content>
                    <va-icon name="dashboard" />
                    <va-sidebar-item-title>
                        {{ $t("DashboardNavigation.dashboard") }}
                    </va-sidebar-item-title>
                </va-sidebar-item-content>
            </va-sidebar-item>
            <va-sidebar-item
                :active="$route.name === 'multilevel-dashboard'"
                @click="$router.push('/multilevel-dashboard')"
                class="pointer"
            >
                <va-sidebar-item-content>
                    <va-icon name="dashboard" />
                    <va-sidebar-item-title>
                        {{ $t("DashboardNavigation.multilevelDashboard") }}
                    </va-sidebar-item-title>
                </va-sidebar-item-content>
            </va-sidebar-item>
        </va-sidebar>
    </div>
    <GlobalLoader></GlobalLoader>
    <router-view> </router-view>
</template>

<style scoped lang="scss">
.sidebar {
    position: absolute;
    left: 0;
    top: 63px;
    bottom: 0;
    z-index: 5;
    box-shadow: 0px -1px 6px 1px #00000014;
    z-index: 10000000;
}
.pointer {
    cursor: pointer;
}

.va-sidebar {
    background-color: var(--app-sidebar-navigation) !important;
}

.va-sidebar__item {
    &.va-sidebar__item__content {
        &:hover {
            .va-icon {
                color: var(--app-icon-color--hover);
            }
        }
    }

    &.va-sidebar-item {
        &.va-sidebar-item--active {
            &:hover {
                .va-icon {
                    color: var(--app-icon-color--hover);
                }

                .va-sidebar__title {
                    color: var(--app-font-color--hover);
                }
            }

            .va-icon {
                color: var(--app-icon-color--active);
            }

            .va-sidebar__title {
                color: var(--app-font-color--active);
            }
        }
    }
}

.va-icon {
    color: var(--app-icon-color);
}

.va-sidebar__title {
    color: var(--app-font-color);
}
</style>
