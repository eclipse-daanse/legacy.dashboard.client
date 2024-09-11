/*
Copyright (c) 2023 Contributors to the  Eclipse Foundation.
This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/
SPDX-License-Identifier: EPL-2.0

Contributors: Smart City Jena

*/

import type { Ref } from "vue";

export function useSerialization<Type>(settings: Ref<Type>) {
    const getState = () => {
        const state = {} as Type;
        const componentState = settings.value;

        for (const key in componentState) {
            state[key] = componentState[key];
        }

        return state;
    };

    return {
        getState,
    };
}
