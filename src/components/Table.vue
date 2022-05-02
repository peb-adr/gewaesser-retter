<template>
  <div>
      <v-select
      v-model="filter"
      :items="filters"
      label="Filter"
      return-object
      solo
      @change="sortData()"
    />
  <v-data-table
    :headers="tableHeader"
    item-key="publicId"
    :items="currentData"
    :single-select="true"
    :items-per-page=-1
    :hide-default-footer="true"
    :options="tableOptions"
    @dblclick:row="onDblClick"
    @contextmenu:row="onContext"
    no-data-text="Keine Daten gefunden"
  />
  </div>
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
    tableOptions: {
        sortBy: ["date", "planned", "name"],
        sortDesc: [false, false, false],
        mustSort: true
    },
    tableHeader: [{
      text: "Name",
      align: "left",
      value: "name",
      sortable: false
    }, {
      text: "Typ",
      align: "left",
      value: "type",
      sortable: false
    }, {
      text: "Eintrag",
      align: "left",
      value: "date",
      sortable: false
    }, {
      text: "Datum",
      align: "left",
      value: "planned",
      sortable: false
    }, {
      text: "url",
      align: "left",
      value: "url",
      sortable: false
    }
    ],
    currentData: [],
    filter: "Alle",
    filterOptions: [{
      label: "Alle",
      fn: () => true
    },{
      label:"Letztes Jahr",
      fn: (i) => new Date(i.date).getFullYear() === new Date().getFullYear() - 1
    },{
      label:"Dieses Jahr",
      fn: (i) => new Date(i.date).getFullYear() === new Date().getFullYear()
    }, {
      label:"Nächste zwei Wochen",
      fn: (i) => new Date(i.date) < new Date().setDate(new Date() + 14) &&
        new Date(i.date) > new Date()
    }, {
      label:"Zukünftig",
      fn: (i) => new Date(i.date) > new Date()
    }]
  }),
  computed: {
    filters: {
      get() {
        return this.filterOptions.map(o => o.label);
      }
    }
  },
  watch: {
    // watcher that triggers as soon as trashData gets an update.
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
      this.currentData = this.trashData.map(f => f.properties);
      const filterFn = this.filterOptions.find(f => this.filter === f.label).fn;
      this.currentData = this.currentData.filter(filterFn);
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
