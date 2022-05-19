<template>
  <v-card v-if="item" elevation="5" class="infomenu-card">
    <h4>{{ item.aktionsname }}
    <v-icon @click.stop="zoomTo()">
          mdi-magnify
        </v-icon></h4>
    <p v-if="item.veranstalter"><i>{{ item.veranstalter }} </i></p>
    {{ item.datum }}
    <span v-if="item.uhrzeit">{{ item.uhrzeit}}h</span> <br />
    <p v-if="item.beschreibung">{{ item.beschreibung }}</p>
    <iframe
      v-if="item.url"
      :src="item.url"
      class="info-iframe"
      frameBorder="0"
    />
  </v-card>
</template>

<script>
// This is the "popup" for a leaflet map item clicked on Map.vue. It has the
// infoItem as a property, and should offer short information. The url property
// might contain external data on a different server (privacy reasons) and is
// currently included in an iframe (TODO: check if that works on mobile + all
// browsers)

export default {
  props: {
    infoItem: Object
  },
  computed: {
    item: {
      get() {
        return this.infoItem ? this.infoItem.properties : {};
      }
    }
  },

  /**
   * emits a "I want to zoom to my position" event to the parent map
  */
  methods: {
    zoomTo() {
      this.$emit('update:zoom', this.infoItem.geometry.coordinates);
    }
  }
};
</script>

<style>
.info-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
.infomenu-card {
  max-width: 25vw;
  max-height: 70vH;
  overflow-y: auto;
  border-radius: 10px !important;
  padding: 5px;
}
</style>