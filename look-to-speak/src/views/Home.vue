<template>
<div class="flex items-center justify-center h-screen">
    <div class="flex">
        <WebCam />
        <Models />
        <Menu />
    </div>
</div>
</template>

<script>
 import WebCam from '@/components/WebCam.vue'
 import Models from '@/components/Models.vue'
 import Menu from '@/components/Menu.vue'

 export default {
     name: 'Home',
     components: {
         WebCam,
         Models,
         Menu
     }
 }
</script>
