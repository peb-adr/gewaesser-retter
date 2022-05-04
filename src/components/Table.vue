<template>
  <div>
      <v-select
      v-model="filter"
      :items="filters"
      label="Filter"
      return-object
      solo
      @change="updateFilter()"
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
// external filter definitions
import filters from "./filters.js"

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
      {
        text: "Name",
        align: "left",
        value: "name",
        sortable: true,
      },
      {
        text: "Typ",
        align: "left",
        value: "type",
        sortable: true,
      },
      {
        text: "Eintrag",
        align: "left",
        value: "date",
        sortable: true,
      },
    ],
    currentData: [],
    filter: "Alle",
    filterOptions: filters
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
    },
    updateFilter() {
      const filter = this.filterOptions.find(f => this.filter === f.label);
      this.$emit('update:filter', filter);
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
