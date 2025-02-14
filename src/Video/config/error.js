import './error.scss';

export const createErrorEl = (text = '视频加载失败') => {
  const error = document.createElement('div');
  error.classList.add('xgplayer-error');
  error.classList.add('app-components-video-error');
  error.innerText = text;
  return error;
};
export default function(Player) {
  const error = function() {
    // eslint-disable-next-line no-invalid-this
    const player = this;

    function createError() {
      const error = createErrorEl();
      player.root.appendChild(error);
    }

    function onError() {
      const error = player.root.querySelector('.app-components-video-error');
      if (!error) createError();
    }

    createError();
    player.on('error', onError);

    function onDestroy() {
      player.off('error', onError);
    }

    player.once('destroy', onDestroy);
  };
  Player.install('error', error);
}
