<template>
  <div id="mapId" class="map" />
</template>

<script>
import * as L from "leaflet";
import "../../node_modules/leaflet/dist/leaflet.css";

export default {
  props: {
    trashData: Object
  },
  data: () => ({
    osm: new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 16,
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }),
    map: null,
    layergroup: L.featureGroup()
  }),
  watch: {
    trashData() {
      this.buildData();
    }
  },
  mounted() {
    this.map = L.map("mapId", {
      attributionControl: true,
      center: [48.5, 10.5],
      zoom: 5,
      maxZoom: 16,
      minZoom: 4,
      fadeAnimation: false,
      zoomControl: false,
    });
    this.osm.addTo(this.map);
    this.layergroup.addTo(this.map);
    this.buildData();
  },
  methods: {
    buildData() {
      this.layergroup.clearLayers();
      const categories = [
        {
          featureFilter: f => f.properties.type === 'trash',
          iconUrl: 'trash-blue.png'
        },
        {
          featureFilter: f => f.properties.type === 'action' && f.properties.done,
          iconUrl: 'trash-green.png'
        },
        {
          featureFilter: f => f.properties.type === 'action' && !f.properties.done,
          iconUrl: 'trash-red.png'
        }
      ]
      for (const category of categories ) {
        const json = {
          "type": "FeatureCollection",
          "features": this.trashData.features.filter(category.featureFilter)
        };
        const layer = L.geoJSON(json, {
          pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
              icon: L.icon({
                iconUrl: category.iconUrl,
                iconSize: [24, 28],
                iconAnchor: [12, 14]
              })
            });
          },
          onEachFeature: function(feature, layer) {
            layer.bindTooltip(
              String("<b>" + feature.properties["name"] + "</b>"), {
                direction: "right",
                offset: [32, 18]
              });
          }
        });
        this.layergroup.addLayer(layer);
      }
    }
  }
};

</script>
<style>
.map {
  height: 80vh;
}
</style>
