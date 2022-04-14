<template>
  <div id="mapId" />
</template>

<script>
import * as L from "leaflet";

export default {
  props: {
    trashData: {
      type: Object,
      default: ()=> {}
    }
  },
  data: () => ({
    osm: new L.TileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 16,
        attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      }),
    map: null
  }),
    watch: {
    trashData() {
      }
    },
    mounted() {
      this.map = L.map("mapId", {
        attributionControl: false,
        center: [48.5, 10.5],
        zoom: 5,
        maxZoom: 16,
        minZoom: 4,
        fadeAnimation: false,
        zoomControl: false,
        layers: [this.osm],
      });
    }
};

</script>
