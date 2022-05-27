<template>
  <v-app>
    <v-snackbar
      v-model="snackbar"
      :timeout="timeout"
      tile
      color="error"
    >
      {{ error }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Schließen
        </v-btn>
      </template>
    </v-snackbar>
    <v-navigation-drawer v-model="drawer" absolute class="top" temporary>
      <v-list nav dense>
        <v-list-item-group>
          <v-list-item-title>Filter: {{ filterName }} </v-list-item-title>
          <v-list-item>
            <v-select
            v-model="filterName"
            :items="filters"
            label="Filter"
            return-object
            solo
            @change="updateFilter"
          />
          </v-list-item>
          <v-list-item @click="zoomToWorld">
            Ausdehnung: Deutschland
          </v-list-item>
          <v-list-item @click="geolocate">
            Finde meine Position
          </v-list-item>

        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-tabs
      v-model="tab">

      <v-tab>
        Karte
      </v-tab>
      <v-tab>
        Aktionen
      </v-tab>
      <v-spacer />
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <!-- tabs definition -->
      <v-tabs-items v-model="tab" touchless>
      <!-- tabs details -->
        <v-tab-item>
          <Map
            v-bind:trashData="filteredTrashData"
            v-bind:infoItem="infoItem"
            v-bind:tabchange="tab"
            v-on:update:mapitem="updateItem"
          />
          <!-- binding data makes children get the updates -->
          <!-- v-on listeners enables children to send events -->
        </v-tab-item>
        <v-tab-item>
          <Table
            v-bind:trashData="filteredTrashData"
            v-on:update:mapitem="updateItem"
            v-on:update:filter="updateFilter"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
    <div class="footer" />
  </v-app>
</template>

<script>
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  get,
  child,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";
import Table from "./Table.vue";
import Map from "./Map.vue";
import filters from "./filters.js";

export default {
  components: {
    Table: Table,
    Map: Map
  },
  data: () => ({
    drawer: false,
    snackbar: false,
    timeout: 2000,
    error: "",
    trashData: [],
    filterOptions: filters,
    filterFn: filters[0].fn,
    filterName: filters[0].label,
    infoItem: null,
    tab: 0,
    firebaseConfig: {
      apiKey: process.env.VUE_APP_apiKey,
      authDomain: process.env.VUE_APP_authDomain,
      databaseURL: process.env.VUE_APP_databaseURL,
      projectId: process.env.VUE_APP_projectId,
      storageBucket: process.env.VUE_APP_storageBucket,
      messagingSenderId: process.env.VUE_APP_messagingSenderId,
      appId: process.env.VUE_APP_messagingSenderId,
    },
  }),
  mounted() {
    this.$root.$on("update:error", (error) => this.showError(error));
    this.useFireBase();
    window.addEventListener('resize', () => this.$root.$emit('resizeevent'));


    // Zoom to Aktion in URL parameter if provided
    let qParams = new URLSearchParams(window.location.search);
    let uuid = qParams.get("uuid")
    if (uuid == undefined) {
      return
    }
    // check if exists in firebase
    get(child(ref(this.db, "/data"), uuid)).then((snap) => {
      if (snap.exists()) {
        // if so, find in trashData
        let results = this.trashData.filter(f => f.properties.uuidPublic === uuid)
        if (results.length === 1) {
          let i = results[0]
          let coords = { lat: i.geometry.coordinates[1], lng: i.geometry.coordinates[0] }
          this.updateItem(i)
          this.$root.$emit("requestzoom", { latlng: coords });
        } else {
          this.$root.$emit("update:error", `${uuid} konnte keiner Aktion zugeordnet werden`);
        }
      } else {
        this.$root.$emit("update:error", `${uuid} konnte keiner Aktion zugeordnet werden`);
      }
    }).catch(() => {
      this.$root.$emit("update:error", `${uuid} konnte keiner Aktion zugeordnet werden`);
    });
  },
  computed: {
    filteredTrashData: {
      get() {
        return this.trashData.filter(this.filterFn);
      },
    },
    filters: {
      get() {
        return this.filterOptions.map(o => o.label);
      }
    }
  },
  methods: {
    isValidGeoJson(item) {
        return item.type === "Feature" &&
        item.geometry &&
        item.geometry.coordinates.length;
    },
    updateFilter() {
      const filter = this.filterOptions.find(f => this.filterName === f.label);
      this.filterFn = filter.fn ? filter.fn : () => true;
      this.filterName = `${filter.label} (${this.trashData.length} Einträge)`;
      this.drawer = false;
    },
    updateItem(e) {
      this.infoItem = e;
      this.tab = 0;
    },
    zoomToWorld() {
      this.$root.$emit("requestzoom", {latlng: {lat: 51, lng: 10}, level: 5});
      this.drawer = false;
    },
    geolocate() {
      this.$root.$emit("geolocateme");
      this.drawer = false;
    },

    showError(error) {
      this.snackbar = true;
      this.error = error || "unbekannter Fehler";
    },

    useFireBase() {
      initializeApp(this.firebaseConfig);
      this.db = getDatabase();
      this.featuresRef = ref(this.db, "/data");
      this.trashData = this.getSynchronizedData(this.featuresRef);
    },

    getSynchronizedData(firebaseRef) {
      let list = [];
      this.syncChanges(list, firebaseRef);
      return list;
    },

    syncChanges(list, ref) {
      onChildAdded(ref, (snap) => {
        const data = snap.val();
        if (!this.isValidGeoJson(data)) {
          console.log("invalid data :" + snap.key)
        } else {
          const idx = list.findIndex((i) => i.properties.uuidPublic === snap.key);
          if (idx > -1) {
            list[idx] = data;
          } else {
            list.push(data);
          }
        }
      });

      onChildRemoved(ref, (snap) => {
        const idx = list.findIndex((i) => i.properties.uuidPublic === snap.key);
        if (idx > -1) {
          list.splice(idx, 1);
        }
      });

      onChildChanged(ref, (snap) => {
        const idx = list.findIndex((i) => i.properties.uuidPublic === snap.key);
        if (!this.isValidGeoJson(snap.val())) {
          console.log("invalid data: " + snap.key)
        } else {
          if (idx > -1) {
            list.splice(idx, 1, snap.val());
          }
        }
      });
    },
  }
};
</script>
<style>
.top {
  z-index: 501 !important;
}
</style>

