<template>
  <div>
    <div id="mapId" class="map" />
    <div class="infomenu" v-if="infoItem">
      <Infomenu v-bind:infoItem="infoItem" v-on:update:zoom="zoomTo" />
    </div>
    <div
      class="contextmenu"
      v-if="contextmenu"
      :style="{ top: contexttop + 'px', left: contextleft + 'px' }"
    >
      <Contextmenu
        v-bind:latlng="contextlatlng"
        v-on:update:action="initiateAktion"
        v-on:update:togglecontext="contextmenu = false"
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
    infoItem: Object,
    tabchange: Number
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
    targetmarker: new L.marker([0,0], {
      icon: L.icon({
        iconUrl: 'target.svg',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }),
      draggable: true
      }),
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
    tabchange() {
      //TODO: check how long the "tab is changin" event actually transitions.
      setTimeout(() => this.$root.$emit('resizeevent'), 250);
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
      zoomControl: false
    });
    // add background and feature layer
    this.osm.addTo(this.map);
    this.targetmarker.on('contextmenu', (evt) => {
      this.contextmenu = false;
      this.contextlatlng = this.targetmarker.getLatLng();
      this.contextleft = evt.containerPoint.x;
      this.contexttop = evt.containerPoint.y;
      this.contextmenu = true;
    });
    this.map.on({
      // trigger: right click/longpress. Overwrites default event listeners.
      // Opens the child element Contextmenu and sets it's position
      contextmenu: (evt) => {
        this.targetmarker.removeFrom(this.map);
        this.contextmenu = false;
        this.targetmarker.setLatLng(evt.latlng);
        this.targetmarker.addTo(this.map);
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
    this.$root.$on('requestzoom', content => {
      const zoom = content.level || 16;
      this.map.setView(content.latlng, zoom);
    });
    this.$root.$on('geolocateme',this.geolocateMe);
    this.$root.$on('resizeevent', () => {
      this.map.invalidateSize()});
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
          const childs = cluster.getAllChildMarkers();
          const finding = childs.find(f=> f.feature.properties.type === 'finding');
          const campaign = childs.find(f=> f.feature.properties.type === 'campaign');
          const closed = childs.find(f=> f.feature.properties.type === 'closed');
          let iconClass = "";
          if (finding) {
            if (campaign || closed) {
              iconClass = 'aktionandtrash';
            } else {
              iconClass = 'trash';
            }
          } else {
            iconClass = 'aktion'
          }
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
          featureFilter: f => f.properties.type === 'finding',
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
    },

    // helper: Sets a zoom, shortly a marker, to give a feedback on where the
    // requesting event happened
    // content: { latlng, url(optional) }
    initiateAktion(url){
        window.open(url,'_blank');
        this.targetmarker.removeFrom(this.map);

    },

    /**
    * Tries to get the current gps- Position. Depends on geo availability and
    * on local browser permissions. On success, zooms to the current position
     */
    geolocateMe(){
      this.map.locate({timeout: 15000});
      this.map.once('locationfound', (evt) => {
        this.$root.$emit('requestzoom', { latlng: evt.latlng, level: 16});
        this.targetmarker.removeFrom(this.map);
        this.targetmarker.setLatLng(evt.latlng);
        this.targetmarker.addTo(this.map);
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
    }

    // /**
    //  * Adds a (pseudo)-legend to the bottom left, currently showing the active
    //  * filters and total amount of items
    //  */
    // addLegend() {
    //   if (this.map) {
    //     this.maplegend.remove();
    //     this.maplegend.onAdd = () => {
    //       const div = L.DomUtil.create('div', 'legend');
    //       div.innerHTML = "<i> Aktiver Filter:<br />" +
    //         this.filterName + ` (${this.trashData.length} Einträge)`;
    //       return div;
    //     }
    //     this.maplegend.addTo(this.map);
    //   }
    // }
  }

};
</script>
<style>

.map {
  height: 85vh;
}

.infomenu {
  position: absolute;
  bottom: 5%;
  right: 2.5%;
  color: black;
  z-index: 498;
  width: 300x;
  max-width: 300px;
}

.contextmenu {
  position: absolute;
  color: black;
  z-index: 499;
  top: 0px;
  left: 0px;
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
  color: #777777;
  font-size:60%;
  font-weight: bold;
  font-style: italic;
}
</style>
