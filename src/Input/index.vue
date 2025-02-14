<template>
  <div class="cx-input-container">
    <input type="text" v-model="value">
  </div>
</template>

<script>
export default {
  name: "Input",
  data() {
    return {
      value: ""
    }
  }
}
</script>

<style scoped>
.cx-input-container {
  background-color: #fff;
}
</style>