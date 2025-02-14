import Video from "./index.vue";

Video.install = (Vue) => {
  Vue.component(Video.name, Video);
};

export { Video }
export default Video;