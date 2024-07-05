import type {Component} from "vue";

export interface IdataDataPointDescription{
    readonly name:string
    readonly namespace:string
    readonly component:any,
    readonly qualifiedName:string,
    readonly description:string,
    readonly example: any;
}
