<template>
<v-card elevation="5" class="contextmenu-card">
  <v-list dense>
    <v-list-item class="item"
      @click="newAktion('aktion')">
      Hier Sammelaktion anlegen
    </v-list-item>
    <!-- <v-list-item class="item"
      @click="geolocateMe()">
        Den aktuellen Standort finden
    </v-list-item> -->
    <v-list-item class="item"
      @click="newAktion('fund')">
      Hier wurde Müll gesammelt
    </v-list-item>
  </v-list>
  </v-card>
</template>
<script>
// This is the contextmenu, a child of Map.vue, triggered by a right click
// (or longpress on mobile) leaflet map event. Offers a menu for actions not
// associated with an existing map object (e.g. adding new items)

export default {
  props: {
    latlng: Object
  },
  data: () => ({
    aktionUrl: process.env.VUE_APP_aktionUrl,
    findingUrl: process.env.VUE_APP_findingUrl
  }),
  methods: {

    /**
     * Triggers a redirect/popup to an external "add new Aktion" form
     */
    newAktion(type){
      // aktionUrl from environment variable, attaching lat and lng at the end
      const url = type === 'aktion' ?
        `${this.aktionUrl}&lat=${this.latlng.lat}&lng=${this.latlng.lng}` :
        `${this.findingUrl}&lat=${this.latlng.lat}&lng=${this.latlng.lng}`
      this.$emit('update:action', url);
      // event to close the context menu
      this.$emit('update:togglecontext');
    },

    /**
     * offers to get current position. Depending on device, this will trigger
     * an "allow website to get position?" dialog (may not work or be well
     * hidden on some browsers)
     */
    // geolocateMe(){
    //   this.$root.emit('geolocateme');
    //   this.$emit('update:togglecontext');
    // }
  }
};
</script>

<style>
.contextmenu-card {
  border-radius: 0px 10px 10px 10px !important;
}
.item {
  border: 1px solid gray;
  border-radius: 5px;
  background: #EEEEEE;
  margin: 3px;
}
</style>