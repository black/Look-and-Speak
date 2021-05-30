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
    <div @click="resetModel()" class="cursor-pointer px-7 py-3 bg-green-500 text-green-800 rounded font-semibold text-center">RESET MODEL</div>
</div>
</template>

<script>
import EyeModel from '@/ml/models.js'

export default {
    name: 'Model',
    props: {
        msg: String,
        img:[]
    },
    data() {
        return {
            status: "STATUS",
            imageChannels: 3,
            model: null,
            eyesCanvas: null,
            eyesCanvasContext: null,
            canvasWidth: 0,
            canvasHeight: 0
        }
    },
    methods: {
         observer() {  
            this.emitter.on("canimage",data=>{ 
                console.log(data.image)
                  this.eyesCanvasContext.drawImage(
                        data.image,
                        data.w, data.h,
                        data.w1, data.h1,
                        0, 0, this.canvasWidth, this.canvasHeight
                    );
            })
        }, 
        createModel() {
            this.canvasWidth = this.eyesCanvas.width
            this.canvasHeight = this.eyesCanvas.height 
            this.model = new EyeModel(this.eyesCanvas)
            this.model.createModel(this.canvasWidth, this.canvasHeight, 3)
            this.status = "Intializing Model" + this.canvasWidth + " \t" + this.canvasHeight;
        },
        dataCollect() {
            //    this.model.dataCollect(this.elm,)
            this.status = "Collecting Data";
          //  this.emitter.emit('trigger', 'left')
        },
        trainModel() {
            this.model.trainModel()
            this.status = "Training Model"; 
        },
        startPrediction() {
            this.status = "Predicting";
            this.model.predict(this.elm, data => {
                console.log(data)
                switch (data) {
                    case 0: 
                        this.emitter.emit('trigger', 'left')
                        break;
                    case 1:
                        this.emitter.emit('trigger', 'right')
                        break;
                    default:
                        this.emitter.emit('trigger', 'normal')
                        break;
                }
            })
        },
        resetModel() {
            this.model.resetModel()
        }
    },
    mounted() {
        this.eyesCanvas = this.$refs.eyes;
        this.eyesCanvasContext = this.eyesCanvas.getContext('2d')
        this.observer()
        this.createModel() 
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
 
</style>
