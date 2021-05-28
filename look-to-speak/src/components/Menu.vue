<template>
<div class="flex flex-col p-10 gap-5 bg-green-800">
    <div class="grid grid-cols-5 h-full gap-3">
        <div class="rounded text-center bg-green-100 p-10 col-span-2">Left</div>
        <div class="rounded text-center bg-green-100 p-10 col-span-1">Normal</div>
        <div class="rounded text-center bg-green-100 p-10 col-span-2">Right</div>
    </div>
</div>
</template>

<script>
     export default {
         name: 'Menu',
         props: {
             msg: String
         },
         data() {
             return {}
         },
         methods: {

         },
         mounted() {

         }
     }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>

</style>
