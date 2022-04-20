<template>
  <v-data-table
    :headers="tableHeader"
    :items="currentData"
    :hide-default-footer="true"
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

      console.log(this.currentData);
      }
  },
  mounted() {
    if (!this.trashData || !this.trashData.features) {
      this.currentData = [];
    } else {
      this.currentData = this.trashData.features.map(
        f => f.properties);
    }
  }
}

</script>

