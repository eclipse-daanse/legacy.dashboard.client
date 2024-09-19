import type {IdataDataPointDescription} from "@/plugins/OGCSTA/composables/IdataDataPointDescription";
import type {Component} from "vue";
import ValueUnitDataLabelRenderer
    from "@/plugins/OGCSTA/widgets/parts/dataLabelRenderer/ValueUnitDataLabelRenderer.vue";

export default class ValueUnitDataLabelRendererDescription implements IdataDataPointDescription {
    public readonly component: any = ValueUnitDataLabelRenderer;
    public readonly description: string = "Renders a value and unit";
    public readonly name: string = 'Value and Unit Data Point Renderer';
    public readonly namespace: string = 'general';
    public readonly qualifiedName: string = 'ValueUnitDataPointRenderer';
    public readonly example: any = ' 15';

}
