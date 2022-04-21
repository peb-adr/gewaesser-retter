<template>
  <div>
  {{ latlng.lat }} -- {{ latlng.lng }}
  </div>
</template>

<script>
export default {
  props: {
    latlng: Array
  }
};

</script>