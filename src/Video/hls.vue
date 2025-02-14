<template>
  <div class="app-components-video-hls"></div>
</template>
<script>
import mixin from './config/mixin';

export default {
  mixins: [mixin],
  methods: {
    getPlayer() {
      return window.HlsJsPlayer;
    },
  },
};
</script>

