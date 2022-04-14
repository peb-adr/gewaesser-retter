<template>
  <div>
    <v-tabs>
      <v-tab>
        Karte
      </v-tab>
      <v-tab>
        Details
      </v-tab>
      <v-tab-item>
        <Map :data="trashData" />
      </v-tab-item>
      <v-tab-item>
        <Table :data="trashData" />
      </v-tab-item>
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
  props: {
    trashData: {
      type: Object,
      default: ()=> {}
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      fetch("dummydata.json")
      .then(response => {
        response.json()
        .then(data => {
          const features = data.features.filter(
            f => f.geometry && f.geometry.coordinates.length
          );
          this.trashData = {
            trash: {
                type: "FeatureCollection",
                features: features.filter(f => f.properties.type === "trash")
            },
            trashaction: {
              type: "FeatureCollection",
              features: features.filter(f => f.properties.type === "action")
            }
          };
        })
      })
    }
  }
}

</script>

<style>
</style>