<template>
  <div class="home"> 
    <p class="py-5 text-blue-600">Home</p>
    <WebCam/>
    <Models/>
  </div>
</template>

<script>
// @ is an alias to /src
import WebCam from '@/components/WebCam.vue'
import Models from '@/components/Models.vue'

export default {
  name: 'Home',
  components: {
    WebCam,
    Models
  }
}
</script>
