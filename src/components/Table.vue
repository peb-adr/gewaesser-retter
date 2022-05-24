<template>
  <v-card>
    <v-data-table
      :headers="tableHeader"
      :items="currentData"
      item-key="uuidPublic"
      :options="tableOptions"

      :items-per-page="10"
      no-data-text="Keine Daten gefunden"
      @dblclick:row="onDblClick"
      show-expand
      :expanded.sync="expanded"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-select
            v-model="filter"
            :items="filters"
            label="Filter"
            return-object
            solo
            @change="updateFilter()"
          />
        </v-toolbar>
      </template>
      <template v-slot:item.tableaction="{ item }">
        <v-icon @click.stop="onDblClick(null, {item})">
          mdi-target
        </v-icon>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-card flat>
            {{ item.beschreibung }}
          </v-card>
          <v-card flat v-if="item.funde">
          Funde: <br />
            <p v-for="(value, name, index) in item.funde" v-bind:value="value"
              v-bind:key="index" class="intable"
              >
              {{ name }} : {{ value }}
              </p>
          </v-card>
        </td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
// external filter definitions
import filters from "./filters.js"

export default {
  props: {
    trashData: Array
  },

  data: () => ({
    expanded: [],
    tableOptions: {
      sortBy: ["datum", "veranstalter", "aktionsname"],
      sortDesc: [false, false, false],
      mustSort: true
    },
    tableHeader: [
      {
        text: "",
        sortable: false,
        value:"tableaction",
      },
      {
        text: "Name",
        align: "left",
        value: "aktionsname",
        sortable: true,
      },
      {
        text: "Veranstalter",
        align: "left",
        value: "veranstalter",
        sortable: true,
      },
      {
        text: "Datum",
        align: "left",
        value: "datum",
        sortable: true,
        sort: (a, b) => {
          const as = a.split('.');
          const bs = b.split('.');
          return new Date(`${as[2]}-${as[1]}-${as[0]}`) - new Date(`${bs[2]}-${bs[1]}-${bs[0]}`)
        }
      },
      {
        text: "Uhrzeit",
        align: "left",
        value: "uhrzeit",
        sortable: false,
      },
      {
        text: "",
        value: "data-table-expand"
        },
    ],
    currentData: [],
    filter: filters[0].label,
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
      this.$emit("update:filter", filter);
    },

    onDblClick(ev, ev2) {
      const item = this.trashData.find(t => t.properties === ev2.item);
      if (item) {
        this.$root.$emit("requestzoom", item.geometry.coordinates);
        this.$emit("update:mapitem", item);
      }
    },
  },
};
</script>

<style>
.intable::first-letter {
    text-transform:capitalize;
}
</style>