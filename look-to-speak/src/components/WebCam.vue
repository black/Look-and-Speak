<template> 
<div class="bg-green-400">
    <div class="p-10">
        <div class="relative h-100 w-100 ">
            <video ref="webcam" id="webcam" class="rounded" width="400" height="300" autoplay loop></video>
            <canvas ref="overlay" id="overlay" class="absolute rounded top-0" width="400" height="300"></canvas>
        </div>
         <div class="cursor-pointer px-7 py-3 bg-green-500 text-green-800 rounded font-semibold text-center">{{face}}</div>
    </div>
</div>
</template>

<script>
import clm from '@/plugins/clmtrackr.js'

export default {
    name: 'WebCam',
    props: {
        msg: String
    },
    data() {
        return {
            video: null,
            overlayCanvas: null,
            overlayCanvasContext: null,
            eyesCanvas: null,
            eyesCanvasContext: null,
            ctrack: null,
            w: 400,
            h: 300,
            face: 0
        }
    },
    methods: {
        initCanvasAndWebCam() {
            this.video = this.$refs.webcam;
            this.overlayCanvas = this.$refs.overlay;
            this.overlayCanvasContext = this.overlayCanvas.getContext('2d');
            this.ctrack = new clm.tracker({
                faceDetection: {
                    useWebWorkers: false,
                },
            });
            this.ctrack.init();
            this.initNavigator()
        },
        initNavigator() {
            navigator.mediaDevices.getUserMedia({
                video: true
            }).then(this.onStreaming);
        },
        onStreaming(stream) {
            this.video.srcObject = stream;
            /*start face tracking*/
            this.ctrack.start(this.video);
            /*draw on face tracking*/
            this.trackingLoop();
        },
        trackingLoop() {
            requestAnimationFrame(this.trackingLoop);

            // Check if a face is detected, and if so, track it.
            let currentPosition = this.ctrack.getCurrentPosition();
            this.face = currentPosition?"Face Detected":"No Face";
            if (currentPosition) {
                this.overlayCanvasContext.clearRect(0, 0, this.w, this.h);
                this.ctrack.draw(this.overlayCanvas);

                const eyesRect = this.getEyesRectangle(currentPosition);
                const resizeFactorX = this.video.videoWidth / this.video.width;
                const resizeFactorY = this.video.videoHeight / this.video.height;

                this.emitter.emit('canimage', {
                    image: this.video,
                    w: eyesRect[0] * resizeFactorX,
                    h: eyesRect[1] * resizeFactorY,
                    w1: eyesRect[0] * resizeFactorX,
                    h2: eyesRect[1] * resizeFactorY
                })

            } 
        },
        getEyesRectangle(positions) {
            const minX = positions[23][0] - 5;
            const maxX = positions[28][0] + 5;
            const minY = positions[24][1] - 5;
            const maxY = positions[26][1] + 5;
            const width = maxX - minX;
            const height = maxY - minY;
            return [minX, minY, width, height];
        }
    },
    mounted() {
        this.initCanvasAndWebCam()
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped> 
</style>
