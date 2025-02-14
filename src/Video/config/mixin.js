import {abortFlvFetch} from '../utils/xgplayer-flv-fetch-abort';
import {accOffHtml, posterHtml} from '../config/poster';
const isUrl = (str) => /^((http|ws)s?:)?\/\//.test(str);
export default {
  props: {
    src: {
      type: String,
    },
    controls: {
      type: Boolean,
      default: true,
    },
    autoplay: {
      type: Boolean,
      default: true,
    },
    width: Number,
    height: Number,
    volume: {
      type: Number,
      default: 0.6,
    },
    playbackRate: {
      type: Number,
      default: 1,
    },
    accStatus: String,
  },
  methods: {
    getPlayer() {
      return window.Player;
    },
    init() {
      const Player = this.getPlayer();
      this.player = new Player({
        'x5-video-player-type': 'h5-page',
        'poster': true,
        'lang': 'zh-cn',
        'el': this.$el,
        'url': this.src,
        'autoplay': this.autoplay,
        'isLive': true,
        'playsinline': true,
        'controls': this.controls,
        'videoInit': true,
        'closeVideoClick': true,
        'closeVideoDblclick': true,
        'closeVideoTouch': true,
        'closePlayerBlur': true,
        'closeControlsBlur': true,
        'closeFocusVideoFocus': true,
        'closePlayVideoFocus': true,
        'width': this.width,
        'height': this.height,
        'volume': this.volume,
        'noLog': true,
      }).once('play', () => {
        const video = this.$el.querySelector('video');
        if (video) {
          this.autoplay ?
              (video.paused && video.play()) :
              (!video.paused && video.pause());
        }
        this.updatePlaybackRate(this.playbackRate);
      });
      this.player.on('error', (err) => {
        // 错误重试(主要解决部分502错误)
        if (!isUrl(err?.currentTime)) return;
        this.player.src = '';
        setTimeout(() => {
          this.player.src = err.currentTime;
          [...this.player.root.querySelectorAll('.app-components-video-error')].forEach((el) => {
            el.style.display = 'none';
          });
        }, 10);
      });
      this.addEvent();
      this.updatePosterHtml();
    },
    play() {
      if (!this.player) return;
      this.player.play();
    },
    stop() {
      if (!this.player) return;
      this.player.stop();
    },
    addEvent() {
      const target = this.$el.querySelector('video');
      if (!target) return;
      target.addEventListener('timeupdate', this.timeUpdateHandle);
      target.addEventListener('play', this.playHandle);
      target.addEventListener('error', this.errorHandle);
      target.addEventListener('pause', this.pauseHandle);
      target.addEventListener('volumechange', this.volumeChangeHandle);
      target.addEventListener('ended', this.endedHandle);
    },
    removeEvent() {
      const target = this.$el.querySelector('video');
      if (!target) return;
      target.removeEventListener('timeupdate', this.timeUpdateHandle);
      target.removeEventListener('play', this.playHandle);
      target.removeEventListener('error', this.errorHandle);
      target.removeEventListener('pause', this.pauseHandle);
      target.removeEventListener('volumechange', this.volumeChangeHandle);
      target.removeEventListener('ended', this.endedHandle);
    },
    timeUpdateHandle(...arg) {
      this.$emit('timeupdate', ...arg);
    },
    playHandle(...arg) {
      this.$emit('play', ...arg);
    },
    errorHandle(...arg) {
      this.$emit('error', ...arg);
    },
    pauseHandle(...arg) {
      this.$emit('pause', ...arg);
    },
    volumeChangeHandle(...arg) {
      this.$emit('volumechange', ...arg);
    },
    endedHandle(...arg) {
      this.$emit('ended', ...arg);
    },
    updatePlaybackRate(value) {
      const video = this.$el.querySelector('video');
      if (video) video.playbackRate = value;
    },
    destroy(isDelDom = false) {
      this.removeEvent();
      if (!this.player) return;
      this.player.destroy(isDelDom);
      delete this.player;
    },
    abortFlvFetch() {
      const flvLoader = this.player?.__flv__?._transmuxer?._controller?._ioctl?._loader;
      if (flvLoader) {
        abortFlvFetch(flvLoader.fetchControllerId);
      }
    },
    updatePosterHtml() {
      const {player, accStatus} = this;
      if (!this.accStatus || !player?.config?.poster) return;
      player.root.querySelector('.xgplayer-poster').innerHTML = accStatus !== '1' ? accOffHtml : posterHtml;
    },
  },
  watch: {
    playbackRate(value) {
      this.updatePlaybackRate(value);
    },
    volume(value) {
      const video = this.$el.querySelector('video');
      if (video) video.volume = value;
    },
    src() {
      if (this.src && !this.destroyed) {
        this.destroy();
        clearTimeout(this.srcTimeMark);
        this.srcTimeMark = setTimeout(() => {
          Array.from(this.$el.classList).
              filter((cName) => !cName.includes('app-components-video')).
              forEach((cName) => this.$el.classList.remove(cName));
          this.init();
        }, 100);
      }
    },
    accStatus: {
      immutable: true,
      handler() {
        this.updatePosterHtml();
      },
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    clearTimeout(this.srcTimeMark);
    this.abortFlvFetch();
    if (this.player) {
      this.player.src = '';
    }
    this.destroyed = true;
    this.destroy(true);
  },
};
