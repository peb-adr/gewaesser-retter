<template>
  <div>
    <div id="mapId" class="map" />
    <div class="infomenu" v-if="infoItem">
      <Infomenu
        v-bind:infoItem="infoItem"
        v-on:update:zoom="zoomTo"
      />
    </div>
    <div class="contextmenu"
      v-if="contextmenu"
      ref="context"
    >
      <Contextmenu v-bind:latlng="contextlatlng" />
    </div>
  </div>
</template>

<script>
import * as L from "leaflet";
import "../../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js";
import "../../node_modules/leaflet.markercluster/dist/MarkerCluster.css";
import "../../node_modules/leaflet/dist/leaflet.css";
import Infomenu from "./Infomenu";
import Contextmenu from "./Contextmenu";

export default {
  components: {
    Infomenu: Infomenu,
    Contextmenu: Contextmenu
  },
  props: {
    trashData: Object,
    infoItem: Object
  },
  data: () => ({
    osm: new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 16,
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }),
    map: null,
    layergroup: L.featureGroup(),
    contextmenu: false,
    contextcoords: []
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
    this.map.on({
      contextmenu: (evt) => {
        this.contextmenu = false;
        this.contextmenu = true;
        this.contextlatlng = evt.latlng;
      },
      click: () => {
        this.contextmenu = false;
        this.$emit('update:mapitem', null);
      }
    });
    this.layergroup.addTo(this.map);
    this.buildData();
    this.$root.$on('requestzoom', coords => this.zoomTo(coords));
  },
  methods: {
    zoomTo(coords){
      this.map.setView([coords[1], coords[0]], 14);
    },
    buildData() {
      this.layergroup.clearLayers();
      const me = this;
      if (!this.trashData.features) { return; }
      var clusterGroup = L.markerClusterGroup({
        animate: true,
        maxClusterRadius: 80,
        iconCreateFunction: function () {
          return L.icon({
              iconUrl: "trash-blue-group.png",
              iconSize: [24, 28],
              iconAnchor: [12, 14]
          });
        }
      });
      this.layergroup.addLayer(clusterGroup);
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
            layer.on("click", function(e) {
              me.$emit('update:mapitem',e.sourceTarget.feature);
            })
          }
        });
        clusterGroup.addLayer(layer);
      }
    }
  }
};

</script>
<style>
.map {
  height: 80vh;
}

.infomenu {
  position: absolute;
  bottom: 5%;
  right: 5%;
  background: rgb(255, 255, 255);
  color: black;
  z-index: 999;
  width: 300x;
  max-width: 300px;
}

</style>
