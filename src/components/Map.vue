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
      :style="{ top:contexttop + 'px', left:contextleft + 'px'}"
    >
      <Contextmenu
      v-bind:latlng="contextlatlng"
      v-on:update:zoom="positionPing"
      v-on:update:togglecontext="contextmenu=false"
      />
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

  // incoming properties (sent by the parent Viewport). trashData contains the
  // geojson data and the full properteis of every item, the infoItem is the
  // currently selected one.
  props: {
    trashData: Array,
    infoItem: Object
  },
  data: () => ({
    // describes the background openstreetmap layer
    osm: new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 16,
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }),
    // the map itself. Should only be initiated once this vue item is existing
    // in the DOM, (i.e. mounted)
    map: null,

    // a group of layers to be added to the map. Top level for everything not
    // being background map
    layergroup: L.featureGroup(),

    contextmenu: false, // toggle for the menu

     // (css) placement for the contextmenu on the canvas
    contextleft: 0,
    contexttop: 0
  }),
  watch: {
    //trigger the data (re)-construction if parent updates data. TODO check
    //with backend finished (might be overkill if just one item changes)
    trashData() {
      this.buildData();
    }
  },

  /**
   * init fucntion once the element exists in the DOM
   */
  mounted() {
    // create the map in the div with the id "mapId"
    this.map = L.map("mapId", {
      attributionControl: true,
      center: [48.5, 10.5],
      zoom: 5,
      maxZoom: 16,
      minZoom: 4,
      fadeAnimation: false,
      zoomControl: false,
    });
    // add background and feature layer
    this.osm.addTo(this.map);
    this.map.on({
      // trigger: right click/longpress. Overwrites default event listeners.
      // Opens the child element Contextmenu and sets it's position
      contextmenu: (evt) => {
        this.contextmenu = false;
        this.contextmenu = true;
        this.contextlatlng = evt.latlng;
        this.contextleft = evt.containerPoint.x;
        this.contexttop = evt.containerPoint.y;
      },
      // general click "somewhere". Closes the contextmenu or any selected
      // item
      click: () => {
        this.contextmenu = false;
        this.$emit('update:mapitem', null);
      }
    });
    this.layergroup.addTo(this.map);
    this.buildData();
    // listen to the root trigger "requestzoom", which listens to the Table
    // component. Do a zoom!
    this.$root.$on('requestzoom', coords => this.zoomTo(coords));
  },

  methods: {
    /**
    * Zoom to a position
    * @params coords: [lon, lat] geojson-style coordinates
    */
    zoomTo(coords){
      this.map.setView([coords[1], coords[0]], 15); // (latlng, zoomlevel)
    },
    /**
     * Parses the trashData geojson, gets the categories (trash, Aktion) and
     * puts them into layers
     */
    buildData() {

      // remove all
      this.layergroup.clearLayers();
      const me = this;
      if (!this.trashData.length) { return; }

      // clustergroups 'join' features close to each other, to avoid
      // cluttering. More advanced icons are possible,
      // TODO add the number of clustered icons
      var clusterGroup = L.markerClusterGroup({
        animate: true,
        maxClusterRadius: 80,
        removeOutsideVisibleBounds: true,
        polygonOptions: { opacity: 0 },
        iconCreateFunction: function () {
          return L.icon({
              iconUrl: "user-plus-solid.png",
              iconSize: [24, 28],
              iconAnchor: [12, 14]
          });
        }
      });
      this.layergroup.addLayer(clusterGroup);

      // defining how to sort/filter the categories for different symbols
      const categories = [
        {
          featureFilter: f => f.properties.type === 'trash',
          iconUrl: 'trash-can-solid.png'
        },
        {
          featureFilter: f => f.properties.type === 'aktion' && f.properties.done,
          iconUrl: 'users-solid.png'
        },
        {
          featureFilter: f => f.properties.type === 'aktion' && !f.properties.done,
          iconUrl: 'users-solid.png'
        }
      ]
      for (const category of categories ) {
        // creating a pseudo geojson for each category
        const json = {
          "type": "FeatureCollection",
          "features": this.trashData.filter(category.featureFilter)
        };
        // creating a leaflet layer
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
            // adding trigger for "hover over item": display basic name
            layer.bindTooltip(
              String("<b>" + feature.properties["name"] + "</b>"), {
                direction: "right",
                offset: [32, 18]
              });
            // adding trigger for "click on item": select this item
            layer.on("click", function(e) {
              me.$emit('update:mapitem',e.sourceTarget.feature);
            })
          }
        });
        // add the layer to the cluster
        clusterGroup.addLayer(layer);
      }
    },

    // helper: Sets a zoom, shortly a marker, to give a feedback on where the
    // requesting event happened
    positionPing(latlng){
      this.zoomTo([latlng.lng, latlng.lat]);
      const layer = new L.marker(latlng, {
        icon: L.icon({
          iconUrl: 'map-pin-solid.png',
          iconSize: [24, 28],
          iconAnchor: [12, 28]
        })
      });
      layer.addTo(this.map);
      setTimeout(()=> this.map.removeLayer(layer), 1500);
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

.contextmenu {
  position: absolute;
  background: rgb(255, 255, 255);
  color: black;
  z-index: 999;
  top: 0px;
  left:0px;
}

</style>
