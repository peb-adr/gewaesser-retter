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
    <v-tabs
      v-model="tab">
      <!-- tabs definition -->
      <v-tab>
        Karte
      </v-tab>
      <v-tab>
        Aktionen
      </v-tab>
      <v-tabs-items v-model="tab" touchless>
      <!-- tabs details -->
        <v-tab-item>
          <Map
            v-bind:trashData="filteredTrashData"
            v-bind:infoItem="infoItem"
            v-bind:filterName="filterName"
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
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";
import Table from "./Table.vue";
import Map from "./Map.vue";
import filters from "./filters.js"

export default {
  components: {
    Table: Table,
    Map: Map
  },
  data: () => ({
    snackbar: false,
    timeout: 2000,
    error: "",
    trashData: [],
    filter: filters[0].fn,
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
  },
  computed: {
    filteredTrashData: {
      get() {
        return this.trashData.filter(this.filter);
      },
    },
  },
  methods: {
    isValidGeoJson(item) {
        return item.type === "Feature" &&
        item.geometry &&
        item.geometry.coordinates.length;
    },
    updateItem(e) {
      this.infoItem = e;
      this.tab = 0;
    },
    updateFilter(e) {
      this.filter = e.fn ? e.fn : () => true;
      this.filterName = e.label || "";
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
