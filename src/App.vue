<template>
  <div id="app">
    <Viewport />
  </div>
</template>

<script>
import Viewport from './components/Viewport.vue'

export default {
  name: 'App',
  components: {
    Viewport
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
