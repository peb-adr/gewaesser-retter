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
    trashData: {
      type: Object,
      default: ()=> {}
    }
  },
  data: () => ({
    tableHeader: [{
      text: "Name",
      align: "left",
      value: "name"
    }],
    currentData: []
  }
  watch: {
    trashData() {
      }
    }
}

</script>

