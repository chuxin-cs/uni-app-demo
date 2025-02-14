<template>
  <div class="app-components-video" :class="{
      'first-frame-acquired':firstFrameAcquired,
      'video-device-error': deviceErrorContent
    }">
    <div v-if="['null','undefined',''].includes(src)" class="app-components-video-empty"
      :style="`background-image:url(${videoEmptyImg})`"></div>
    <template v-else-if="!deviceErrorContent && !firstFrameAcquired&&!emptyVideo">
      <template v-if="isLoaderLib&&url">
        <HslVideo v-if="videoType==='hls'" ref="video" v-bind="attrs"  :src="videoUrl"
          :acc-status="accStatus" @timeupdate="timeupdateHandle" @play="playHandle" />
        <FlashVideo v-else-if="videoType==='flash'" ref="video" v-bind="attrs" :src="videoUrl"
          :acc-status="accStatus" @timeupdate="timeupdateHandle" @play="playHandle" />
        <DefaultVideo v-else ref="video" v-bind="attrs"  :src="videoUrl" :acc-status="accStatus"
          @timeupdate="timeupdateHandle" @play="playHandle" />
        <div class="app-components-video-mask" v-if="$attrs.click" @click="click"></div>
      </template>
      <span v-if="loading" v-html="loadingHtml"></span>
    </template>
    <div class="empty-video-content-wrap" v-if="(deviceErrorContent || emptyVideo)&&!firstFrameAcquired"
      v-html="emptyVideoContent" :style="emptyVideoContentStyle">
    </div>
    <canvas height="0" width="0" ref="canvas" v-show="firstFrameAcquired" v-if="firstFrame"></canvas>
  </div>
</template>

<script>
// 组件
import HslVideo from './hls.vue';
import FlashVideo from './flash.vue';
import DefaultVideo from './default.vue';
// service
import Player from 'xgplayer';
import FlvJsPlayer from 'xgplayer-flv.js';
import posterConfig from './config/poster';
import errorConfig from './config/error';
import { createPosterHtml } from './config/poster';
import { createErrorEl } from './config/error';
import DeviceStatusMixin from './mixins/device-status';
import videoEmptyImg from './assets/video-empty.png';

const loadingHtml = createPosterHtml();
const errorHtml = createErrorEl().outerHTML;
export default {
  name: "video",
  inheritAttrs: false,
  components: { HslVideo, FlashVideo, DefaultVideo },
  mixins: [DeviceStatusMixin],
  props: {
    src: String,
    width: Number,
    height: Number,
    fetchUtil: [Function, Object],
    firstFrame: {
      type: Boolean,
      default: false,
    },
    emptyVideo: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    emptyVideoContentStyle() {
      return `width:${this.width}px;height:${this.height}px;`;
    },
    attrs() {
      return {
        width: this.width,
        height: this.height,
        ...this.$attrs,
      };
    },
    emptyVideoContent() {
      if (this.deviceErrorContent) {
        return this.getErrorHtml(this.deviceErrorContent);
      }
      return this.emptyLoading ? loadingHtml : errorHtml;
    },
    videoType() {
      if (this.connectType) return this.connectType;
      if (`${this.url}`.includes('.flv')) return 'flash';
      if (`${this.url}`.includes('.m3u8')) return 'hls';
      return 'default';
    },
    videoUrl() {
      return this.switching || this.deviceErrorContent ? '' : (this.connectUrl || this.url);
    },
  },
  data() {
    return {
      videoEmptyImg,
      loading: false,
      emptyLoading: this.emptyVideo,
      url: '',
      isLoaderLib: false,
      loadingHtml,
      firstFrameAcquired: false,
    };
  },
  mounted() {
    if (
      window.FlvJsPlayer &&
      window.Player &&
      // window.HlsJsPlayer &&
      window.VideoLibLoaded
    ) return this.isLoaderLib = true;
    this.$nextTick(() => {
      window.Player = Player;
      window.FlvJsPlayer = FlvJsPlayer;
      posterConfig(window.Player);
      errorConfig(window.Player);
      this.isLoaderLib = true;
      if (!window.VideoLibLoaded) this.$emit('videoLibLoaded');
      window.VideoLibLoaded = true;
    })
  },
  watch: {
    src() {
      this.updateUrl();
    },
  },
  methods: {
    isCanvasBlank(canvas) {
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      blank.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      return canvas.toDataURL() === blank.toDataURL();
    },
    updateEmptyLoading(val) {
      this.emptyLoading = !!val;
    },
    setFirstFrame(video) {
      clearTimeout(this.setFirstFrameTimeMark);
      if (!video.duration) {
        if (document.body.contains(video)) this.setFirstFrameTimeMark = setTimeout(() => this.setFirstFrame(video), 1000);
        return;
      }
      if (this.firstFrameAcquired || !document.body.contains(video)) return;
      const containerWidth = this.$el.offsetWidth;
      const containerHeight = this.$el.offsetHeight;
      const canvas = this.$refs.canvas;
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, containerWidth, containerHeight);
      if (this.isCanvasBlank(canvas)) return;
      this.firstFrameAcquired = true;
      this.emptyLoading = false;
    },
    timeupdateHandle(...arg) {
      if (this.firstFrame) {
        const video = this.$el.querySelector('video');
        this.setFirstFrame(video);
      }
      this.$emit('timeupdate', ...arg);
    },
    playHandle(...arg) {
      if (this.firstFrame) {
        const video = this.$el.querySelector('video');
        setTimeout(() => this.setFirstFrame(video));
      }
      this.$emit('play', ...arg);
    },
    updateUrl() {
      const src = this.src;
      if (['', 'null', 'undefined'].includes(this.src)) return this.url = src;
      const mark = `${Date.now()}${Math.random().toString().slice(2)}`;
      this.mark = mark;
      this.loading = true;
      this.getRealUrl(src).then((url) => {
        if (this.mark === mark) this.url = url;
      }).finally(() => {
        if (this.mark === mark) this.loading = false;
      });
    },
    getRealUrl(src) {
      if (!this.fetchUtil ||
        /(http|https):\/\/([\w.]+\/?)\S*/.test(src)
      ) {
        return Promise.resolve(src);
      }
      const [simNo, channelNo] = `${src || ''}`.split('@');
      return this.fetchUtil.get(
        '/device-manage/device/startDeviceVideo',
        { params: { channelNo, simNo } },
      ).
        then(({ data }) => Promise.resolve(data)).
        catch(() => Promise.resolve(src));
    },
    click() {
      this.$emit('click');
    },
    init() {
      this.$refs['video'].init();
    },
    play() {
      this.$refs['video'].play();
    },
    stop() {
      this.$refs['video'].stop();
    },
    destroy() {
      this.$refs['video'].destroy();
    },
    getErrorHtml(val) {
      return val && createErrorEl(val).outerHTML || '';
    },
  },
  created() {
    this.updateUrl();
  },
  beforeDestroy() {
    clearTimeout(this.setFirstFrameTimeMark);
  },
};
</script>
<style lang="scss">
.app-components-video {
  position: relative;
  overflow: hidden;

  &.first-frame-acquired {
    line-height: 0;
  }

  .empty-video-content-wrap {
    text-align: center;
  }

  .xgplayer-start,
  .xgplayer-enter,
  .xgplayer-error,
  .xgplayer-poster {
    z-index: 1 !important;
    transition: opacity .3s;
  }

  .xgplayer-skin-default .xgplayer-progress-played {
    background-image: linear-gradient(-90deg, #1890ff, #0d5ce3) !important;
  }

  .xgplayer-skin-default .xgplayer-drag {
    background-color: #1890ff;
  }

  .xgplayer-skin-default .xgplayer-error .xgplayer-error-refresh {
    color: #1890ff !important;
  }

  video {
    object-fit: fill;
  }
}

.app-components-video-mask {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.app-components-video-empty {
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  background-color: #adadad;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.video-device-error {
  z-index: 3;

  .empty-video-content-wrap {
    height: 100%;
  }

  .app-components-video-error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #fff;
  }
}
</style>
