/**
 * 开启视频通道功能
 */
import Axios from 'axios';

const getParamsFromUrl = (src) => {
  if (!src) {
    return;
  }
  // 播放url支持配置、自适应前缀功能
  const url = new URL(src.replace(/^(\w+:)*\/\//i, (a, b) => {
    a = (a || '').toLowerCase();
    // 自适应前缀: http -> ws，https -> wss
    const autoPrefix = location.protocol.replace('http', 'ws');
    return b ? a : `${autoPrefix}${a}`;
  }));
  const params = ['token', 'deviceNo', 'streamType', 'dataType', 'channelNo'].reduce((p, c) => {
    p[c] = url.searchParams.get(c) ?? p[c];
    return p;
  }, {});
  const [, sim, channelNo] = url.pathname.match(/\/(\d+)-(\d+)$/) || [];
  params.sim = sim;
  params.channelNo = channelNo ?? params.channelNo;
  params.streamType = {0: 'high', 1: 'low'}[params.streamType || 0];
  params.url = `${url.href}&channel=${params.channelNo}`;
  return params;
};

export default {
  inject: {
    getVideoDeviceId: {
      default() {},
    },
    getVideoPlateNumber: {
      default() {},
    },
  },
  props: {
    // 连接方式
    connetMethod: String,
  },
  data() {
    return {
      accStatus: '0',
      deviceErrorContent: null,
      eventName: '',
      accLoading: true,
    };
  },
  computed: {
    connectType() {
      return {
        'websocket': 'flash',
      }[this.connetMethod];
    },
    connectUrl() {
      if (!this.connectType) return null;
      const params = getParamsFromUrl(this.url);
      return (!this.deviceErrorContent && params?.url) || '';
    },
  },
  watch: {
    src: {
      immediate: true,
      handler() {
        this.switching = true;
        this.$nextTick(() => {
          this.switching = false;
        });
        switch (this.connetMethod) {
          case 'http-dynamic': {
            this.doHttpDynamic();
          } break;
        }
      },
    },
  },
  methods: {
    doHttpDynamic() {
      if (this.src) {
        Axios(this.src).then((res) => {
          const {result, data, resultDesc} = res || {};
          if (result) {
            this.url = data;
          } else {
            this.$Message.error(resultDesc);
          }
        }).catch((err) => {
          console.error(err);
          this.$Message.error('获取视频播放地址失败');
        });
      }
    },
    statusHandler(e) {
      const {detail: data} = e;
      this.accStatus = data?.accStatus;
      if (data.onlineStatus !== 'true' || data.accStatus !== '1') {
        const isExist = window.__itbus__video_device_status[data.deviceNo];
        if (!isExist && this.deviceErrorContent) {
          this.$Message.error(this.deviceErrorContent);
        }
        this.deviceErrorContent = data.msg;
        return;
      }
    },
  },
  beforeDestroy() {
    const deviceNo = this.eventName.split('_')[1];
    if (window.__itbus__video_device_status?.[deviceNo]) {
      delete window.__itbus__video_device_status[deviceNo];
    }
    window.removeEventListener(this.eventName, this.statusHandler);
  },
};
