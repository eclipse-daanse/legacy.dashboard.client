/*
  Copyright (c) 2023 Contributors to the  Eclipse Foundation.
  This program and the accompanying materials are made
  available under the terms of the Eclipse Public License 2.0
  which is available at https://www.eclipse.org/legal/epl-2.0/
  SPDX-License-Identifier: EPL-2.0

  Contributors: Smart City Jena

*/
import Main from "../routes/main/Main.vue";
import Dashboard from "../routes/dashboard/Dashboard.vue";
import MultilevelDashboard from "../routes/dashboard/MultilevelDashboard.vue";
import { createRouter, createWebHashHistory } from "vue-router";
// let routes: { path: string; component: any }[];

const routes = [
  { path: "/designer", component: Main, name: "designer" },
  { path: "/dashboard", component: Dashboard, name: "dashboard" },
  {
    path: "/",
    component: MultilevelDashboard,
    name: "multilevel-dashboard",
      //children: [{ path: '/multilevel-dashboard/url/:uri', name: 'loadDefault', component: MultilevelDashboard }],
  },
] as any;

export const router = createRouter({
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});
