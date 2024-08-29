import type {IDSRenderer, IRenderer} from "@/plugins/TestPlugin/widgets/api/Renderer";
import type {Datastream, Thing} from "@/plugins/TestPlugin/dataSources/STAClient";



export function useComparator() {



    const compareThing = (th: Thing,renderer:IRenderer) => {

        let firstStep = false;


        if (renderer.thing) {


            if (!th) return false;
            if (renderer.thing.prop == '*') {
                firstStep = true;
            } else {

                if (!(Object.keys(th).includes(renderer.thing.prop))) {
                    return false
                }
                if (th[renderer.thing.prop].toString() === renderer.thing.value) firstStep = true;
            }

        } else {
            firstStep = true;
        }
        return  firstStep;
    }

    const compareDatastream=(ds:Datastream, renderer:IDSRenderer)=>{

            if(!renderer.datastream){
                return true
            }else{
                if(!ds) return false;
                if(renderer.datastream.prop == '*') {return true
                }else{
                    if(!Object.keys(ds).includes(renderer.datastream.prop)) {return false}
                    if(ds[renderer.datastream.prop].toString()  == renderer.datastream.value) return true;
                }
            }
        }


    return {
        compareThing,
        compareDatastream
    }

}
