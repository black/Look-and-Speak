<template>
  <div class="webcam">
      <video></video>
      <canvas id="eyes" class="bg-danger h-100"></canvas>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped> 
</style>
