import type {AxisData, Composer, CSVSelector, Selector} from "@/plugins/charts/widgets/api/ChartdataComposer";
import type {Datastream, Thing} from "@/plugins/TestPlugin/dataSources/STAClient";
import {computed, type ComputedRef, ref, type Ref} from "vue";

export interface OGGSTASelector extends Selector {
    things?: Thing[];
    datastreams?: Datastream[];
}

export default class OGSTAComposer implements Composer<OGGSTASelector> {

    private selectorX: OGGSTASelector | undefined;
    private selectorY: Array<OGGSTASelector> = [];
    private data: Ref<any> = ref({});
    private store: IStore | undefined;

    addSelectorY(selector: OGGSTASelector) {
        this.selectorY.push(selector);
    }

    getDataX(): ComputedRef<AxisData> | Ref<AxisData> {
        return computed(() => {
            try {
                return {//@ts-ignore
                    data: this.data.map(e => e[this.selectorX!.header]),
                    title: this.selectorX?.header,
                    from: this.selectorX
                } as AxisData
            } catch (e) {
                return {
                    data: [],
                    title: this.selectorX?.header,
                    from: undefined,
                } as AxisData
            }
        });
    }

    getDataY(): ComputedRef<Array<AxisData>> | Ref<Array<AxisData>> {
        return undefined;
    }

    getSelectorX(): OGGSTASelector | undefined {
        return this.selectorX;
    }

    getSelectorsY(): OGGSTASelector[] {
        return this.selectorY;
    }

    setData(data: Ref<any>): void {
        this.data = data;
    }

    setSelectorX(selector: OGGSTASelector) {
        this.selectorX = selector;
    }

    setSelectorY(index: number, selector: OGGSTASelector): void {
    }

    setStore(store: IStore): void {
        this.store = store;
    }

    getStore(): IStore | undefined {
        return this.store;
    }

}
