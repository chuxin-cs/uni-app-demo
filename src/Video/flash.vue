<template>
  <div class="app-components-video-flv"></div>
</template>
<script>
import mixin from './config/mixin';

export default {
  mixins: [mixin],
  methods: {
    getPlayer() {
      return window.FlvJsPlayer;
    },
  },
};
</script>

