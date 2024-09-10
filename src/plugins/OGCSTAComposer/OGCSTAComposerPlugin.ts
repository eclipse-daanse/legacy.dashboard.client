import StaStore from "@/plugins/OGCSTA/stores/StaStore";
import useComposerManager from "@/plugins/charts/composables/ComposerManager";
import OGSTAComposer from "@/plugins/OGCSTAComposer/composer/OGCSTAComposer";
import type {Component} from "vue";
import OGCSTAComposerV from "@/plugins/OGCSTAComposer/composer/OGCSTAComposerV.vue";

export default {
    install: (app) => {
        useComposerManager().registerComposer(OGSTAComposer, OGCSTAComposerV as unknown as Component, StaStore.TYPE)
    }
};
