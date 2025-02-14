/**
 * 终断所有 xgplayer-flv 中的fetch请求
 */
export const abortAllFlvFetch = () => {
  if (!window.__XGPLAYER_CONTROLLERS) return;
  try {
      Object.values(window.__XGPLAYER_CONTROLLERS)?.forEach((i) => i?.abort?.());
  } catch (e) {
    console.error('abortAllFlvFetch: __XGPLAYER_CONTROLLERS is error');
    throw e;
  }
  window.__XGPLAYER_CONTROLLERS = {};
};

/**
 * 终断单个 xgplayer-flv 中的fetch请求
 */
export const abortFlvFetch = (id) => {
  if (!window.__XGPLAYER_CONTROLLERS || !window.__XGPLAYER_CONTROLLERS[id]) return;
  window.__XGPLAYER_CONTROLLERS[id].abort();
  delete window.__XGPLAYER_CONTROLLERS[id];
};

export default {
  abortAllFlvFetch,
};
