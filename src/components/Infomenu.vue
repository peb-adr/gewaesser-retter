<template>
  <div v-if="item">
    {{ item.name }} <br/> <v-btn @click="zoomTo()">zoom </v-btn>
    {{ item.type }} <br/>
    {{ item.date }} <br/>
    <iframe v-if="item.url" :src="item.url" class="info-iframe"/>
  </div>

</template>

<script>
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
  methods: {
    zoomTo() {
      this.$emit('update:zoom', this.infoItem.geometry.coordinates);
    }
  }
};
</script>

<style>
.info-iframe {
  width: 100;
  height: 100;
  border: none;
}