<template>
  <div>
    <v-tabs
      v-model="tab">
      <v-tab>
        Karte
      </v-tab>
      <v-tab>
        Details
      </v-tab>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <Map v-bind:trashData="trashData" />
        </v-tab-item>
        <v-tab-item>
          <Table v-bind:trashData="trashData" />
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
    tab: null,
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
    }
  }
}

</script>
