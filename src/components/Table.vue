<template>
  <v-data-table
    :headers="tableHeader"
    item-key="name"
    :items="currentData"
    :single-select="true"
    :items-per-page=-1
    :hide-default-footer="true"
    @dblclick:row="onDblClick"
    @contextmenu:row="onContext"
    no-data-text="Keine Daten gefunden"
  />
  <!-- active-class="active-tab" expanded-item for small devices -->
</template>

<script>
// The table view, getting it's data from the viewport. Should offer
// filtering

export default {
  props: {
    trashData: Array
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
      value: "date",
      sortable: true,
      sort: (a, b) => a - b
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
      this.sortData();
    }
  },
  mounted() {
    if (!this.trashData || !this.trashData.length) {
      this.currentData = [];
    } else {
      this.sortData();
    }
  },
  methods: {
    sortData() {
      this.currentData = this.trashData.map(f => f.properties).sort(
          (a,b) => a.date > b.date);
    },
    onDblClick(ev, ev2){
      const item = this.trashData.find(t => t.properties === ev2.item);
      if (item) {
        this.$root.$emit('requestzoom', item.geometry.coordinates);
        this.$emit('update:mapitem', item);
      }
    },
    onContext(evt, row) {
      console.log(row.item);
    }
  }
}

</script>
