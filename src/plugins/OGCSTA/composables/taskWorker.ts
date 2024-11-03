import {Task, type TaskI} from "@/plugins/OGCSTA/composables/tasktimer";
import {inject, ref} from "vue";
import {difference, intersection} from "lodash";

import {useStore} from "@/composables/widgets/store";
import StaStore from "@/plugins/OGCSTA/stores/StaStore";
import type {Datastream} from "@/plugins/OGCSTA/dataSources/STAClient";
import {useWebWorkerFn} from "@vueuse/core";

let store:IStore|undefined = undefined;

self.addEventListener("message", evt => {
    if(evt.data.command == 'setStore') setStore(evt.data.payload);
    if(evt.data.command == 'addTasksAndIvnoke') addTasksAndIvnoke(evt.data.payload);
    if(evt.data.command == 'invokeTask') invokeTask(evt.data.payload);
    if(evt.data.command == 'hasTask') {
        const result = hasTask(evt.data.payload);
        postMessage({result:'hasTask',payload:result})
    }
});

const timer = ref<Map<string,TaskI>>(new Map<string,TaskI>())
const addTasksAndIvnoke = ( ptasks:TaskI[] )=>{
    use
    const tasks:TaskI[] = [];
    for(const planTasks of ptasks){
             tasks.push( new class extends Task {
            readonly id = planTasks.id;
            private handle;

            invoke() {
                window.clearInterval(this.handle)
            }

            run() {
                const { workerFn } = useWebWorkerFn(() => {
                    (store as StaStore).getObservations({"@iot.id":this.id} as unknown  as  Datastream)
                })
                console.log('run')
                if(store){


                }

            }
        });
    }


    let listofTasks = Array.from(timer.value.keys());
    let toHold = intersection(listofTasks,tasks.map(t=>t.id));
    let toAdd = difference(tasks.map(t=>t.id),listofTasks);
    timer.value.forEach((task,key) =>{
        if(!toHold.includes(key)){
            console.log('invoking Task:'+key);
            task.invoke();
            timer.value.delete(key);
        }
    })
    tasks.forEach(t=>{
        if(toAdd.includes(t.id)){
            if(!timer.value.has(t.id)) {
                console.log('adding Task:' + t.id);
                timer.value.set(t.id, t);
                t.run();

            }
        }
    });
}
const invokeTask = (id:string):void=>{
    timer.value.get(id)?.invoke();
    timer.value.delete(id);
}
const hasTask=(id:string)=>{
    return timer.value.has(id);
}
const setStore = (astore:IStore)=>{
    store = astore
}



