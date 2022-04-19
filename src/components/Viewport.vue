<template>
  <div>
    <v-tabs
      v-model="tab">
      <v-tab>
        Karte
      </v-tab>
      <v-tab>
        Details
      </v-tab>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <Map :data="trashData" />
        </v-tab-item>
        <v-tab-item>
          <Table :data="trashData" />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
    <div class="footer" />
  </div>
</template>

<script>

import Table from "./Table.vue";
import Map from "./Map.vue";

export default {
  components: {
    Table: Table,
    Map: Map
  },
  data: () => ({
    trashData: {},
    tab: null,
  })
}

</script>
