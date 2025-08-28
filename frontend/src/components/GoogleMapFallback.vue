<template>
  <div class="map-container">
    <iframe
      :src="googleMapUrl"
      width="100%"
      height="250"
      style="border: 0"
      allowfullscreen=""
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: "GoogleMapFallback",
  data() {
    return {
      googleMapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2137.8854354122286!2d11.9686789!3d57.6993155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x464ff3f521aa2c1b%3A0x0!2zNTfCsDQxJzI5LjkiTiAxMcKwNTgwJzExLjYiRQ!5e0!3m2!1ssv!2sse!4v1693400000000!5m2!1ssv!2sse",
    };
  },
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 250px;
  position: relative;
}
iframe {
  border-radius: 4px;
}
</style>
