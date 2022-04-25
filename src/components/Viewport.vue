<template>
  <div>
    <v-tabs
      v-model="tab">
      <!-- tabs definition -->
      <v-tab>
        Karte
      </v-tab>
      <v-tab>
        Details
      </v-tab>
      <v-tabs-items v-model="tab">
      <!-- tabs details -->
        <v-tab-item>
          <Map
            v-bind:trashData="trashData"
            v-bind:infoItem="infoItem"
            v-on:update:mapitem="updateItem"
          />
          <!-- binding data makes children get the updates -->
          <!-- v-on listeners enables children to send events -->
        </v-tab-item>
        <v-tab-item>
          <Table
          v-bind:trashData="trashData"
          v-on:update:mapitem="updateItem"
        />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
    <div class="footer" />
  </div>
</template>

<script>

import Table from "./Table.vue";
import Map from "./Map.vue";

export default {
  components: {
    Table: Table,
    Map: Map
  },
  data: () => ({
    trashData: {},
    infoItem: null,
    tab: 0,
  }),
  mounted() {
    this.fetchDummyData();
  },
  methods: {
    fetchDummyData() {
      fetch("dummydata.json").then((response) => {
        response.json().then((data) => {
          const features = data.features.filter(
            (f) => f.geometry && f.geometry.coordinates.length
          );
          this.trashData = {
            type: "FeatureCollection",
            features: features,
          };
        });
      });
    },
    updateItem(e){
      this.infoItem = e;
      this.tab = 0;
    }
  }
}

</script>
