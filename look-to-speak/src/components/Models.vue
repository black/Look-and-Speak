<template>
<div class="flex flex-col p-10 gap-5 bg-green-600">
    <div class="relative ">
        <div class="flex items-center">
            <canvas ref="eyes" id="eyes" width="300" height="150" class="rounded bg-green-200"></canvas>
        </div>
        <div class="absolute top-0 p-3">
            <span>{{eyes.w }}</span>x<span>{{eyes.h}}</span>
        </div> 
    </div>
    <button type="button" class="bg-green-300 rounded flex items-center al py-3 px-5" disabled>
        <span class="px-5">{{status}}</span>
        <progress class="rounded" v-bind:value="counter" v-bind:max="maxprog"></progress>
    </button>
    <div class="flex gap-5">
        <div @click="dataCollect()" class="cursor-pointer px-7 py-3 bg-green-300 text-green-800 rounded font-semibold" v-bind:class="{'bg-green-500':state.collect}">COLLECT</div>
        <div @click="trainModel()" class="cursor-pointer px-7 py-3 bg-green-300 text-green-800 rounded font-semibold" v-bind:class="{'bg-green-500': state.train}">TRAIN</div>
        <div @click="startPrediction()" class="cursor-pointer px-7 py-3 bg-green-300 text-green-800 rounded font-semibold" v-bind:class="{'bg-green-500': state.predict}">PREDICT</div>
    </div>
    <div @click="resetModel()" class="cursor-pointer px-7 py-3 bg-green-500 text-green-800 rounded font-semibold text-center">RESET MODEL</div>
    <input type="text" @keydown="createDataSet" class="hidden">
</div>
</template>

<script>
import EyeModel from '@/ml/EyeModel.js'
import * as tf from '@tensorflow/tfjs' 


export default {
    name: 'Model',
    props: {
        msg: String,
        img: []
    },
    data() {
        return {
            status: "STATUS",
            imageChannels: 3,
            eyemodel: null,
            eyes: {
                canvas: null,
                context: null,
                w: 0,
                h: 0,
            },
            state: {
                collect: false,
                train: false,
                predict: false
            },
            label: 0,
            imageArray: [],
            labelArray: [],
            counter: 0,
            maxprog: 100
        }
    },
    methods: {
        observer() {
            // this.emitter.on("canimage", () => {
            //     // console.log(data)
            //     // this.eyesCanvasContext.drawImage(
            //     //     './assets/logo.svg',
            //     //     data.w, data.h,
            //     //     data.w1, data.h1,
            //     //     0, 0, this.canvasWidth, this.canvasHeicsght
            //     // );
            // })
        },
        initCanvas() {
            this.eyes.canvas = this.$refs.eyes;
            this.eyes.context = this.eyes.canvas.getContext('2d')
            this.eyes.w = this.eyes.canvas.width
            this.eyes.h = this.eyes.canvas.height
        },
        initModel() {
            this.eyemodel = new EyeModel()
            this.eyemodel.createModel(this.eyes.w, this.eyes.h, 3)
            this.status = "Init Model "
        },
        dataCollect() {
            this.state.collect = !this.state.collect;
            this.status = this.state.collect ? "Collecting Data" : "Stopped Collecting";
            this.maxprog = 5;
            let grab = setInterval(() => {
                if (this.counter > this.maxprog - 1) {
                    this.state.collect = !this.state.collect;
                    this.counter = 0;
                    console.log(this.labelArray.toString())
                    clearInterval(grab)
                    return;
                }
                this.collectData()
                this.counter++;
            }, 100)

        },
        trainModel() {
            if (this.state.collect) {
                alert("Data is stll collecting")
                return;
            }
            this.maxprog = 10;
            this.state.train = !this.state.train;
            this.status = this.state.train ? "Start Training" : "Stopped Training";
            this.eyemodel.trainModel(this.imageArray,this.labelArray);
        },
        startPrediction() {

            if (this.status.train) {
                alert("Model is stll traning")
                return
            } 

            this.state.predict = !this.state.predict;
            this.status = this.state.predict ? "Start Predicting" : "Stopped Predicting";

            this.eyemodel.predict(this.getImage(), data => {
                if (!this.state.predict) {
                    return;
                }
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
            this.eyemodel.resetModel()
        },
        collectData() {
            const img = tf.tidy(() => {
                const captureImg = this.getImage();
                return captureImg;
            })
            this.imageArray.push(img)
            this.label = parseInt(Math.random() * 3)
            this.labelArray.push(this.label) //--- labels are 0,1,2
        },
        getImage() {
            return tf.tidy(() => {
                const image = tf.browser.fromPixels(this.eyes.canvas);
                const batchedImage = image.expandDims(0);
                const norm = batchedImage.toFloat().div(tf.scalar(255)).sub(tf.scalar(1));
                return norm;
            });
        }
    },
    mounted() {
        this.initCanvas()
        this.initModel()
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
 
</style>

Home -->
    WebCam.vue  
    Canvas.vue
