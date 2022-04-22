<template>
  <v-card>
    <v-btn @click="newTrash()">Hier eintragen: Müllsammlung</v-btn>
    <br/>
    <v-btn @click="newAktion()">Hier eintragen: geplante Aktion</v-btn>
    <br/>
    <v-btn @click="geolocateMe()">gehe zu meiner Position</v-btn>
    <br/>
  </v-card>
</template>

<script>
export default {
  props: {
    latlng: Object
  },
  methods: {
    newTrash(){
    },
    newAktion(){
      this.positionPing();
    },
    geolocateMe(){
      this.positionPing();
    },
    positionPing(){
      this.$emit('update:zoom', this.latlng);
      this.$emit('update:togglecontext');
    }
  }
};

</script>