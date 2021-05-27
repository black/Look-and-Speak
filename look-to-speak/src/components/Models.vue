<template>
  <div class="flex flex-col p-10 gap-5">
    <span>{{status}}</span>
    <div class="flex gap-5">
      <div class="border p-10">Left</div>
      <div class="border p-10">Normal</div>
      <div class="border p-10">Right</div>
    </div>
    <div class="flex gap-5">
      <div @click="dataCollect()" class="cursor-pointer px-7 py-3 bg-green-600 text-green-100 rounded font-semibold">COLLECT</div>
      <div @click="trainModel()" class="cursor-pointer px-7 py-3 bg-blue-500 text-blue-100 rounded font-semibold">TRAIN</div>
       <div @click="startPrediction()" class="cursor-pointer px-7 py-3 bg-yellow-400 text-yellow-800 rounded font-semibold">PREDICT</div>
    </div>
  </div>
</template>

<script>    
import eyeModel from '../ml/models.js'
import $ from 'jquery'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data(){
    return{
      status:"Status",
      imageChannels:3,
      model:new eyeModel(),
      elm:$('#eyes')[0],
      canvasWidth:this.elm.width(),
      canvasHeight:this.elm.height()
    }
  },
  methods:{
    createModel(){
      this.model.createModel(this.canvasWidth,this.canvasHeight)
      this.status = "Intializing Model" +this.canvasWidth + " \t" +this.canvasHeight; 
    }, 
    dataCollect(){
      this.status = "Collecting Data"; 
  //    this.model.dataCollect(this.elm,)
    },
    trainModel(){
  //    this.model.trainModel()
     this.status = "Training Model";
    },
    startPrediction(){
      this.status = "Predicting";
      // this.model.predict(this.elm,data=>{
      //   console.log(data)
      // })
    } 
  },
  mounted(){
    this.createModel()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
 
</style>
