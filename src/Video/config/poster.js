import './poster.scss';
import logo from '../assets/logo.svg';

export const createPosterHtml = ({
  className,
  title = '智慧公交',
  desc = '引领公交，走向智能',
} = {}) => `<div class="app-components-video-poster ${className||''}">
        <div class="app-components-video-poster-content">
          <div class="app-components-video-poster-content-top">
            <img 
              class="app-components-video-poster-content-top-left" 
              src="${logo}" 
              alt=""/>
            <div class="app-components-video-poster-content-top-right">
              <span class="app-components-video-poster-content-top-right-top">${title}</span>
              <span class="app-components-video-poster-content-top-right-bottom">${desc}</span>
            </div>
          </div>
          <div class="app-components-video-poster-content-center">
            <div class="app-components-video-poster-content-center-item"></div>
          </div>
          <div class="app-components-video-poster-content-bottom">视频加载中</div>
        </div>
      </div>`;
export const posterHtml = createPosterHtml();
export const accOffHtml = createPosterHtml({
  className: 'app-components-video-acc-off',
  title: '设备ACC已关',
  desc: '可能无法查看视频，尝试连接中',
});
export default function(Player) {
  const poster = function() {
    // eslint-disable-next-line no-invalid-this
    const player = this;
    const util = Player.util;
    const poster = util.createDom('xg-poster', '', {}, 'xgplayer-poster');
    const root = player.root;
    if (player.config.poster) {
      poster.innerHTML = posterHtml;
      const oldPoster = root.querySelector('.xgplayer-poster');
      if (oldPoster) root.removeChild(oldPoster);
      root.appendChild(poster);
    }

    function playFunc() {
      poster.style.display = 'none';
    }

    player.on('canplay', playFunc);

    function destroyFunc() {
      player.off('canplay', playFunc);
      player.off('destroy', destroyFunc);
    }

    player.once('destroy', destroyFunc);
  };

  Player.install('poster', poster);
}
