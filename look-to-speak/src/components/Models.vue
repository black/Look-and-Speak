<template>
<div class="flex flex-col p-10 gap-5 bg-green-600">
    <canvas ref="eyes" id="eyes" width="300" height="150" class="rounded bg-green-200"></canvas>
    <button type="button" class="bg-green-300 rounded flex items-center al py-3 px-5" disabled>
        <img class="animate-spin h-6 p-1" src="../assets/loading.svg">
        <span>{{status}}</span>
    </button>
    <div class="flex gap-5">
        <div @click="dataCollect()" class="cursor-pointer px-7 py-3 bg-green-500 text-green-800 rounded font-semibold">COLLECT</div>
        <div @click="trainModel()" class="cursor-pointer px-7 py-3 bg-green-500 text-green-800 rounded font-semibold">TRAIN</div>
        <div @click="startPrediction()" class="cursor-pointer px-7 py-3 bg-green-300 text-green-800 rounded font-semibold">PREDICT</div>
    </div>
</div>
</template>

<script>
import EyeModel from '@/ml/models.js'

export default {
    name: 'Model',
    props: {
        msg: String
    },
    data() {
        return {
            status: "STATUS",
            imageChannels: 3,
            model: new EyeModel(),
            eyesCanvasContext: null,
            canvasWidth: 0,
            canvasHeight: 0
        }
    },
    methods: {
        drawEyes() {
            // this.eyesCanvasContext.drawImage(
            //     this.video,
            //     eyesRect[0] * resizeFactorX, eyesRect[1] * resizeFactorY,
            //     eyesRect[2] * resizeFactorX, eyesRect[3] * resizeFactorY,
            //     0, 0, this.eyesCanvas.width, this.eyesCanvas.height
            // );
        },
        createModel() {
            this.canvasWidth = this.canEyes.width
            this.canvasHeight = this.canEyes.height

            this.model.createModel(this.canvasWidth, this.canvasHeight, 3)
            this.status = "Intializing Model" + this.canvasWidth + " \t" + this.canvasHeight;
        },
        dataCollect() {
            //    this.model.dataCollect(this.elm,)
            this.status = "Collecting Data";
            this.emitter.emit('trigger','left')
        },
        trainModel() {
            //    this.model.trainModel()
            this.status = "Training Model";
            this.emitter.emit('trigger','right')
        },
        startPrediction() {
            this.status = "Predicting";
            // this.model.predict(this.elm,data=>{
            //   console.log(data)
            // })
        }
    },
    mounted() {
        // this.createModel()
        this.eyesCanvasContext = this.$refs.eyes.getContext('2d')
        console.log("mounted")
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
 
</style>
