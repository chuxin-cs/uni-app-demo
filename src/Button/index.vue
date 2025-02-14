<template>
  <div class="cx-button-container">
    <button>
      <slot />
    </button>
  </div>
</template>

<script>
export default {
  name:"Button"
}
</script>

<style scoped>
.cx-button-container{
  background-color: #fff;
}
</style>