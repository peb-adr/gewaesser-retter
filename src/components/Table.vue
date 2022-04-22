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
export default {
  props: {
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

