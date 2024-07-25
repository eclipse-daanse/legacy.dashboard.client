/*
 * Copyright (c) 2023 Contributors to the Eclipse Foundation.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 */
/**
 * @vitest-environment happy-dom
 */
import { expect, test } from 'vitest'
// @ts-ignore
import {useDatasourceManager} from "@/composables/datasourceManager";
import { defineComponent } from 'vue'
import {mount} from "@vue/test-utils";
import STADataSource from "../../src/plugins/TestPlugin/dataSources/STADataSource";
import EventBus from "../../src/plugins/EventBus";
import * as JSDOM from "jsdom";


const TestComponent = defineComponent({

    setup (props) {
        const dsm = useDatasourceManager();
        dsm.registerDataSource(STADataSource);

        return dsm;
    },
    render(){}

})
const wrapper = mount(TestComponent,{
    global: {
        // to pass options to plugins, use the array syntax.
        plugins: [[EventBus]]
    },
})

let id;





test('init RESTDataSources ', async () => {

    id = wrapper.vm.initDatasource(STADataSource.TYPE,'https://5g.data-in-motion.biz/sensinact/rest',"Test");
    let data = await wrapper.vm.getDatasource(id).getData();
    console.log(data);
    expect( wrapper.vm.getDatasource(id).id).toBe(id)
})

