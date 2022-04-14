<template>
  <div id="mapId" class="map" />
</template>

<script>
import * as L from "leaflet";
import "../../node_modules/leaflet/dist/leaflet.css";

export default {
  data: () => ({
    osm: new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 16,
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }),
    map: null,
    trashData: {}
  }),
  mounted() {
    this.map = L.map("mapId", {
      attributionControl: false,
      center: [48.5, 10.5],
      zoom: 5,
      maxZoom: 16,
      minZoom: 4,
      fadeAnimation: false,
      zoomControl: false,
    });
    this.osm.addTo(this.map);
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
            trash: {
              type: "FeatureCollection",
              features: features.filter((f) => f.properties.type === "trash"),
            },
            trashaction: {
              type: "FeatureCollection",
              features: features.filter((f) => f.properties.type === "action"),
            },
          };
        });
      });
    }
   },
};

</script>
<style>
.map {
  height: 90vh;
}
</style>
