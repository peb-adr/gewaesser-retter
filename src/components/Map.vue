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
      v-on:geolocate="geolocateMe"
      v-on:update:togglecontext="contextmenu=false"
      />
    </div>
  </div>
</template>

<script>
import * as L from "leaflet";
import "../../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js";
import "../../node_modules/leaflet.markercluster/dist/MarkerCluster.css";
import "../../node_modules/leaflet.defaultextent/dist/leaflet.defaultextent.css";
import "../../node_modules/leaflet.defaultextent/dist/leaflet.defaultextent.js";
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
    infoItem: Object,
    filterName: String
  },
  data: () => ({
    // describes the background openstreetmap layer
    osm: new L.TileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", {
      maxZoom: 16,
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }),

    maplegend: L.control({position: "bottomleft"}),

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
    },
    filterName() {
      this.addLegend();
    }
  },

  /**
   * init fucntion once the element exists in the DOM
   */
  mounted() {
    // create the map in the div with the id "mapId"
    this.map = L.map("mapId", {
      attributionControl: true,
      center: [51, 10],
      zoom: 5,
      maxZoom: 16,
      minZoom: 5,
      fadeAnimation: false,
      zoomControl: false,
      defaultExtentControl: true
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
    window.addEventListener('resize', () => this.map.invalidateSize());
  },

  methods: {
    /**
    * Zoom to a position
    * @params coords: [lon, lat] geojson-style coordinates
    */
    zoomTo(coords){
      this.map.setView([coords[1], coords[0]], 16); // (latlng, zoomlevel)
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

      // creating the cluster
      const cluster = L.markerClusterGroup({
        animate: true,
        maxClusterRadius: 80,
        removeOutsideVisibleBounds: true,
        showCoverageOnHover: false,
        iconCreateFunction: function (cluster) {
          //TODO: chose different
          const iconClass = "aktion";
          return L.divIcon({
            html: '<div class="divIconCluster ' +
                iconClass +
              '"></div><div class="myMarkerCluster">' +
                cluster.getChildCount() +
                "</div>",
              iconSize: [40, 40],
              className: ""
            });
        }
      });
      // defining how to sort/filter the categories for different symbols
      const categories = [
        {
          featureFilter: f => f.properties.type === '',
          iconClass: 'trash'
        },
        {
          featureFilter: f => f.properties.type === 'closed',
          iconClass: 'aktion-done'
        },
        {
          featureFilter: f => f.properties.type === 'campaign',
          iconClass: 'aktion'
        }
      ]
      for (const category of categories ) {
        // creating a pseudo geojson for each category
        const json = {
          "type": "FeatureCollection",
          "features": this.trashData.filter(category.featureFilter)
        };
        if (!json.features.length){
          continue;
        }
        // creating a leaflet layer
        const layer = L.geoJSON(json, {
          pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
              icon: L.divIcon({
                html: '<div class="divIconCluster ' +
                  category.iconClass +
                  '"</div><div class="myMarkerString" />',
                iconSize: [40, 40],
                className: ""
              })
            });
          },
          onEachFeature: function(feature, layer) {
            // adding trigger for "hover over item": display basic name
            layer.bindTooltip(
              String(
                "<b>" +
                feature.properties["aktionsname"].replace(/</g, "&#60;") +
                "<br><i>" +
                feature.properties["veranstalter"].replace(/</g, "&#60;") +
                "</i></b>"
              ), {
                direction: "right",
                offset: [10, 10]
              });
            // adding trigger for "click on item": select this item
            layer.on("click", function(e) {
              me.$emit('update:mapitem',e.sourceTarget.feature);
            });
          }
        });
        // add the layer to the cluster
        cluster.addLayer(layer);
      }
      this.layergroup.addLayer(cluster);
      this.addLegend();
    },

    // helper: Sets a zoom, shortly a marker, to give a feedback on where the
    // requesting event happened
    // content: { latlng, url(optional) }
    positionPing(content){
      this.zoomTo([content.latlng.lng, content.latlng.lat]);
      const layer = new L.marker(content.latlng, {
        icon: L.icon({
          iconUrl: 'map-pin-solid.png',
          iconSize: [30, 40],
          iconAnchor: [15, 40]
        })
      });
      layer.addTo(this.map);
      setTimeout(()=> {
        this.map.removeLayer(layer);
        if (content.url) {
          window.open(content.url,'_blank');
        }
      }, 1500);
    },

    /**
    * Tries to get the current gps- Position. Depends on geo availability and
    * on local browser permissions. On success, zooms to the current position
     */
    geolocateMe(){
      this.map.locate({timeout: 15000});
      this.map.once('locationfound', (evt) => {
        this.positionPing({ latlng: evt.latlng });
        this.contextlatlng = evt.latlng;
        // see https://leafletjs.com/reference-1.7.1.html#map-locationfound
        if (evt.accuracy > 1500) {
          this.$root.$emit("update:error",
            "Positionsbestimmung ist sehr ungenau");
        }
      })
      this.map.once('locationerror', (err) => {
        let error = "Position konnte nicht ermittelt werden";
        if (err.code === 1) {
          error += ": Keine Berechtigung";
        this.$root.$emit("update:error", error);
      // see https://leafletjs.com/reference-1.7.1.html#map-locationerror
      // err.code 1 PERMISSION_DENIED
      // 2 POSITION_UNAVAILABLE
      // 3 TIMEOUT
        }
      })
    },

    /**
     * Adds a (pseudo)-legend to the bottom left, currently showing the active
     * filters and total amount of items
     */
    addLegend() {
      if (this.map) {
        this.maplegend.remove();
        this.maplegend.onAdd = () => {
          const div = L.DomUtil.create('div', 'legend');
          div.innerHTML = "<i> Aktiver Filter:<br />" +
            this.filterName + ` (${this.trashData.length} Einträge)`;
          return div;
        }
        this.maplegend.addTo(this.map);
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

.contextmenu {
  position: absolute;
  background: rgb(255, 255, 255);
  color: black;
  z-index: 999;
  top: 0px;
  left:0px;
}

.divIconCluster {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-size: 40px;
}

.aktion {
  background-image: url("../../public/users-solid-grey.png");
}

.aktion-done {
  background-image: url("../../public/users-solid-grey-done.png");
}

.trash {
  background-image: url("../../public/recycle-grey.png");
}

.aktionandtrash {
  background-image: url("../../public/users-recycling.png");
}

.myMarkerCluster {
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
  background-color: darkslategrey;
  color: white;
  position: absolute;
  top: 60%;
  left: 60%;
  font-weight: bold;
  text-align: center;
}

.myMarkerString {
  position: absolute;
  top: 85%;
  width: 100%;
  height: 2.3em;
  line-height: normal;
  overflow: hidden;
  color:#777777;
  font-weight: bold;
  font-style: italic;
}

</style>
