<template>
  <v-data-table
    :headers="tableHeader"
    item-key="name"
    :items="currentData"
    :single-select="true"
    items-per-page:-1
    :hide-default-footer="true"
    @dblclick:row="onDblClick"
  />
</template>

<script>
// TODO The table view, getting it's data from the viewport. Should offer some
// sorting and filtering

export default {
  props: {
    // trashData is the raw geojson that the Map gets too (to be in sync), for
    // display, further conversion needs to be done to get an array of items.
    trashData: Object
  },
  data: () => ({
    tableHeader: [{
      text: "Name",
      align: "left",
      value: "name"
    }, {
      text: "Typ",
      align: "left",
      value: "type"
    }, {
      text: "Eintrag",
      align: "left",
      value: "date"
    }, {
      text: "Datum",
      align: "left",
      value: "planned"
    }, {
      text: "url",
      align: "left",
      value: "url"
    }
    ],
    currentData: []
  }),
  watch: {
    // watcher that triggers as soon as trashData gets an update. TODO: Re-check
    // once the backend is implemented
    trashData() {
      this.currentData =
        this.trashData.features.map(f => f.properties);
      }
  },
  mounted() {
    if (!this.trashData || !this.trashData.features) {
      this.currentData = [];
    } else {
      this.currentData = this.trashData.features.map(
        f => f.properties);
    }
  },
  methods: {
    onDblClick(ev, ev2){
      const item = this.trashData.features.find(t => t.properties === ev2.item);
      if (item) {
        this.$root.$emit('requestzoom', item.geometry.coordinates);
        this.$emit('update:mapitem', item);
      }
    }
  }
}

</script>
