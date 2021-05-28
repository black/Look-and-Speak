<template>
<div class="bg-blue-200 p-10">
    <video ref="webcam" id="webcam" width="400" height="300" class="bg-blue-800 rounded"></video>
    <canvas ref="overlay" id="overlay" width="400" height="300"></canvas>
</div>
</template>

<script>
import * as clm from '@/plugins/clmtrackr.js'

export default {
    name: 'WebCam',
    props: {
        msg: String
    },
    data() {
        return {
            overlayCanvas: null,
            overlayCanvasContext: null,
            eyesCanvas: null,
            eyesCanvasContext: null,
            ctrack: null,
            video: null,
            w: 400,
            h: 300
        }
    },
    methods: {
        initCanvasAndWebCam() {
            this.overlayCanvas = this.$refs.overlay;
            this.overlayCanvasContext = this.overlayCanvas.getContext('2d');
            // this.eyesCanvas = this.$refs.eyes;
            // this.eyesCanvasContext = this.eyesCanvas.getContext('2d');
        },
        initCLMTracker() {
            this.ctrack = new clm.tracker();
            this.ctrack.init();
        },
        initNavigator() {
            this.video = this.$refs.webcam;
            navigator.mediaDevices.getUserMedia({
                    video: true
                })
                .then(stream => {
                    this.video.srcObject = stream;
                    this.video.play()
                    /* --- Start face tracking --- */
                    this.ctrack.start(this.video);
                    /* --- Draw on face tracking --- */
                    this.trackingLoop()
                })
        },
        trackingLoop() {
            // Check if a face is detected, and if so, track it.
            requestAnimationFrame(this.trackingLoop);
            let currentPosition = this.ctrack.getCurrentPosition();
            this.overlayCanvasContext.clearRect(0, 0, this.w, this.h);

            if (currentPosition) {
                this.ctrack.draw(this.overlayCanvas);
                // // Get the eyes rectangle and draw it in red:
                const eyesRect = this.getEyesRectangle(currentPosition);
                this.overlayCanvasContext.strokeStyle = 'red';
                this.overlayCanvasContext.strokeRect(eyesRect[0], eyesRect[1], eyesRect[2], eyesRect[3]);
                /*
                const resizeFactorX = this.video.videoWidth / this.video.width;
                const resizeFactorY = this.video.videoHeight / this.video.height;

                this.$emit('eyeImage',{
                  image:this.video,
                  w:eyesRect[0] * resizeFactorX, 
                  h:eyesRect[1] * resizeFactorY,
                  w1:eyesRect[0] * resizeFactorX,
                  h2:eyesRect[1] * resizeFactorY
                })
                */
                // The video might internally have a different size, so we need these
                // factors to rescale the eyes rectangle before cropping:
                // const resizeFactorX = this.video.videoWidth / this.video.width;
                //const resizeFactorY = this.video.videoHeight / this.video.height;

                // // Crop the eyes from the video and paste them in the eyes canvas:  
                // this.eyesCanvasContext.drawImage(
                //     this.video,
                //     eyesRect[0] * resizeFactorX, eyesRect[1] * resizeFactorY,
                //     eyesRect[2] * resizeFactorX, eyesRect[3] * resizeFactorY,
                //     0, 0, this.eyesCanvas.width, this.eyesCanvas.height
                // );
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
        this.initCLMTracker()
        this.initNavigator()
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped> 
</style>
