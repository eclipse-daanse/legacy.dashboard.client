import type {IdataDataPointDescription} from "@/plugins/TestPlugin/composables/IdataDataPointDescription";

const storeRegistry: Map<string, IdataDataPointDescription> = new Map();

export function useDataPointRegistry() {

    const registerDataPointRenderer = (rendererDescription: IdataDataPointDescription) => {
        storeRegistry.set(rendererDescription.namespace + rendererDescription.qualifiedName, rendererDescription)
    }
    const unregisterDataPointrender = (rendererDescription: IdataDataPointDescription) => {
        storeRegistry.delete(rendererDescription.namespace + rendererDescription.qualifiedName);
    }
    const getAll = () => {
        return storeRegistry
    }
    const getById = (id) => {
        return storeRegistry.get(id)
    }

    return {
        registerDataPointRenderer,
        unregisterDataPointrender,
        getAll,
        getById
    }
}
