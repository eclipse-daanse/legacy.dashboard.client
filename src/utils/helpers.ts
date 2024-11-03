/*
  Copyright (c) 2023 Contributors to the  Eclipse Foundation.
  This program and the accompanying materials are made
  available under the terms of the Eclipse Public License 2.0
  which is available at https://www.eclipse.org/legal/epl-2.0/
  SPDX-License-Identifier: EPL-2.0

  Contributors: Smart City Jena

*/
import {isArray} from "lodash";

export function optionalArrayToArray(el: any): any[] {
    if (Array.isArray(el)) return el;
    if (el) {
        return [el];
    }
    return [];
}

export function transposeArray(array){
    return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
}

export function findMaxinArrayByField(fieldname:string|string[], arraylike:object){
    try {
        let init = 0
        // @ts-ignore
        return arraylike.reduce((accumulator, currentValue,currentIndex,array) => {
            let obj = array[currentIndex]
            if(isArray(fieldname)){
                for (const name of fieldname){
                    obj = obj[name];
                }
            }else {
                obj = obj[fieldname];
            }
            let sint =  parseInt(obj);
            return (sint>accumulator)?sint:accumulator
        }, init);
    }
    catch (e){
        throw new Error(`${fieldname} not a key`)
    }
}

export function resolve(start) {
    return [].slice.call(arguments, 1).reduce(function(obj, prop) {
        return obj && obj[prop];
    }, start);
}
export function resolveObj(obj,dotNotatedstring:string) {
    const replace = dotNotatedstring.replace("\\.","<|>");
    try{
        return replace.split('.').reduce((o,i)=>{
            const aNumber =parseInt(i);
            if(isFinite(aNumber) && Array.isArray(o)){
                return o[aNumber];
            }
            return  o[i.replace("<|>",".")]
        } , obj)
    }catch (e){
        return null;
    }

}


