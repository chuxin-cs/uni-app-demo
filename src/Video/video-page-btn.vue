<template>
  <div class="app-components-dispatch-main-video-page-btn" :class="{'is-next':isNext,'disabled':disabled}"
    @click="click">
    <i class="iconfont icon-back"></i>
  </div>
</template>

<script>
export default {
  props: {
    isNext: Boolean,
    disabled: Boolean,
  },
  methods: {
    click(e) {
      if (this.disabled) return;
      this.$emit('click', e);
    },
  },
};
</script>

<style lang="scss" scoped>
.app-components-dispatch-main-video-page-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, .45);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color .3s;

  i {
    color: white;
    font-size: 20px;
  }

  &.is-next {
    i {
      transform: rotateZ(180deg);
    }
  }

  &:not(.disabled):hover {
    i {
      color: #1890FF;
    }
  }

  &.disabled {
    cursor: not-allowed;

    i {
      color: rgba(white, .25);
    }

    background-color: rgba(255, 255, 255, .25);
  }
}
</style>
