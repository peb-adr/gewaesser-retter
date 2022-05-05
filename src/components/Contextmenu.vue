<template>
<v-card elevation="5">
  <v-list>
    <v-list-item
      @click="newTrash()">
      Hier eintragen: Müllsammlung
    </v-list-item>
    <v-list-item
      @click="newAktion()">
      Hier eintragen: geplante Aktion
    </v-list-item>
    <v-list-item
      @click="geolocateMe()">
        Gehe zu meiner Position
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
  methods: {
    /**
     * TODO: triggers a redirect/popup to an external "add new trash
     * collection" form
     */
    newTrash(){
      this.positionPing();
      this.$root.$emit("update:error", "TODO: Weiterleitung noch nicht implementiert");
    },

    /**
     * TODO: triggers a redirect/popup to an external "add new Aktion" form
     */
    newAktion(){
      this.positionPing();
      this.$root.$emit("update:error", "TODO: Weiterleitung noch nicht implementiert");
    },

    /**
     * offers to get current position. Depending on device, this will trigger
     * an "allow website to get position?" dialog (may not work or be well
     * hidden on some browsers)
     */
    geolocateMe(){
      this.$emit('geolocate');
      this.$emit('update:togglecontext');
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