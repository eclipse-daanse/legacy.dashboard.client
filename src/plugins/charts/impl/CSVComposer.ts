import type {AxisData, Composer, CSVSelector, XMLASelector} from "@/plugins/charts/widgets/api/ChartdataComposer";
import {computed, type ComputedRef, type Ref, ref, watch} from "vue";




export class CSVComposer implements Composer<CSVSelector>{

    private selectorX:CSVSelector|undefined;
    private selectorY:{
        [key:string]:Array<CSVSelector>
    }= {};
    private data: Ref<any> = ref({});
    private store: IStore|undefined;



    addSelectorY(selector: CSVSelector,axisName:string) {
        if(!this.selectorY[axisName]){
            this.selectorY[axisName]=[];
        }

        this.selectorY[axisName].push(selector);
    }
    getSelectorsY(){
        return this.selectorY;
    }
    setSelectorY(selector:CSVSelector,axisName:string){
        if(!this.selectorY[axisName]){
            this.selectorY[axisName]=[];
            this.selectorY[axisName].push(selector)
            //this.selectorY[index] = selector;
        }else{

           this.selectorY[axisName].forEach((elm,index)=>{

                if( elm.id == selector.id){
                    this.selectorY[axisName].splice(index,1,selector)
                }
            });
        }

    }

    setSelectorX(selector: CSVSelector) {
        this.selectorX = selector;
    }
    getSelectorX(){
        return this.selectorX;
    }

    setData(data:Ref<any>) {
        this.data=data;
    }
    setStore(store:IStore){
        this.store = store;
    }
    getStore(){
        return this.store;
    }

    getDataX(): ComputedRef<AxisData> | Ref<AxisData> {
        return computed(()=>{
            try{
                return {//@ts-ignore
                    data: this.data.map(e=>e[this.selectorX!.header]),
                    title: this.selectorX?.header,
                    from:this.selectorX
                } as AxisData
            }
            catch (e) {
                return  {
                    data: [],
                    title: this.selectorX?.header,
                    from:undefined,
                } as AxisData
            }
        });
    }

    getDataY(): ComputedRef<Array<AxisData>> | Ref<Array<AxisData>> {
        return computed(()=>{
            let ret:AxisData[] = [];
            const axises = Object.keys(this.selectorY);
            axises.forEach((axisName) => {
                this.selectorY[axisName].forEach(sel => {
                    try {
                        ret.push({//@ts-ignore
                            data: this.data.map(e => {
                                return {x: e[this.selectorX!.header], y: e[sel.header]}
                            }),
                            title: sel.header,
                            from: axisName
                        } as AxisData);
                    } catch (e) {
                        console.error(e)
                    }
                });
            });
            return ret;

        });
    }

    setSelectorsY(selectors: CSVSelector[], axisName: string = 'y'): void {
        if(!this.selectorY[axisName]){
            this.selectorY[axisName]=[];
        }

        this.selectorY[axisName]=selectors;
    }
    async restoreState(state) {
        this.setSelectorX(state.selectorX);
        for (let sely in state.selectorY) {
            state.selectorY[sely].forEach(sel => {
                this.addSelectorY(sel, sely);
            })

        }
    }


}
