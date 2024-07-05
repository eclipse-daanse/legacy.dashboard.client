import type {IdataDataPointDescription} from "@/plugins/TestPlugin/composables/IdataDataPointDescription";
import TLCDataLabelRenderer from "@/plugins/TestPlugin/widgets/parts/dataLabelRenderer/TLCDataLabelRenderer.vue";
import type {Component} from "vue";

export default class TLCDataLabelRendererDescription implements IdataDataPointDescription{
    public readonly component:any = TLCDataLabelRenderer;
    public readonly description: string = "renders a Trafic Light DataPoint";
    public readonly name: string= 'Traffic Light Data Point Renderer';
    public readonly qualifiedName: string= 'tlc';
    public readonly namespace: string ='tlc';
    public readonly example: any =' 🟢⚪⚪';
}
