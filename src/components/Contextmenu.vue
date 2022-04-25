<template>
  <v-card>
    <v-btn @click="newTrash()">Hier eintragen: Müllsammlung</v-btn>
    <br/>
    <v-btn @click="newAktion()">Hier eintragen: geplante Aktion</v-btn>
    <br/>
    <v-btn @click="geolocateMe()">gehe zu meiner Position</v-btn>
    <br/>
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
  methods: {
    /**
     * TODO: triggers a redirect/popup to an external "add new trash
     * collection" form
     */
    newTrash(){
      this.positionPing();
      // TODO open form, remove marker
    },

    /**
     * TODO: triggers a redirect/popup to an external "add new Aktion" form
     */
    newAktion(){
      this.positionPing();
      // open form, remove marker
    },

    /**
     * TODO: offer a button to get current position (and adding a collection
     there?). Depending on device, this will trigger an "allow website to get
     position?" dialog
     */
    geolocateMe(){
      this.map.locate({timeout: 15000});
      this.map.once('locationfound', (evt) => {
        this.map.setView(evt.latlng, 14);
        // see https://leafletjs.com/reference-1.7.1.html#map-locationfound
      })
      this.map.once('locationError', (err) =>
      // see https://leafletjs.com/reference-1.7.1.html#map-locationerror
      //TODO: some feedback
      console.log(err)
      )
    },

    /**
     * Triggers a zoom to the position and a short(ish) appearance of a marker.
     * Probably useful to give an initial feedback on "this is where we think
     * you clicked"
     */
    positionPing(){
      this.$emit('update:zoom', this.latlng);

      // event to close the context menu
      this.$emit('update:togglecontext');
    }
  }
};
</script>