<template>
<div class="flex flex-col p-10 gap-5 bg-green-800">
    <div class="p-3 text-green-100 bg-green-500 rounded">
        <span>TTS is {{ttsApi?"Supported":"Not Supported"}}</span>
    </div>
    <div class="grid grid-cols-5 h-full gap-3">
        <div class="rounded text-center bg-green-100 transition-all duration-100 ease-out p-5 col-span-2" v-bind:class="{'bg-red-500': side=='left'}">
            <ul>
                <li v-for="item in leftMenu" :key="item">{{item}}</li>
            </ul>
        </div>
        <div class="rounded text-center bg-green-100 p-5 col-span-1">Normal</div>
        <div class="rounded text-center bg-green-100 transition-all duration-100 ease-out p-5 col-span-2" v-bind:class="{'bg-red-500': side=='right'}">
            <ul>
                <li v-for="item in rightMenu" :key="item">{{item}}</li>
            </ul>
        </div>
    </div>
    <div class="text-center text-green-100 bg-green-500 rounded p-3">{{selected}}</div>
</div>
</template>

<script>
export default {
    name: 'Menu',
    props: {
        msg: String
    },
    data() {
        return {
            selected: "PANEL",
            menu: ["Hello", "Thank you", "Great", "Ok", "What's your name?", "How are you?", "Can you repeat that?", "What's going on?", "Yes", "No", "Maybe", "Please", "I need some help please", "TV Please", "Music Please", "Water Please"],
            leftMenu: [],
            rightMenu: [],
            ttsApi: false,
            side: 'normal'
        }
    },
    methods: {
        observer() {
            this.emitter.on("trigger", side => {
                this.side = side
                if (side == "left") this.leftSelect()
                else if (side == "right") this.rightSelect()
                this.resetHighlight()
            })

            this.emitter.on("data-image",data=>{
                console.log(data)
            })
        },
        leftSelect() {
            if (this.leftMenu.length < 2) {
                this.playSound(this.leftMenu[0])
                this.resetMenu()
                return;
            }
            let l = Math.floor(this.leftMenu.length / 2)
            this.selected = "LEFT " + l
            this.rightMenu = this.leftMenu.slice(-l)
            this.leftMenu = this.leftMenu.slice(0, l) 
        },
        rightSelect() {
            if (this.rightMenu.length < 2) {
                this.playSound(this.rightMenu[0])
                this.resetMenu()
                return;
            }
            let l = Math.floor(this.rightMenu.length / 2)
            this.selected = "RIGHT " + l
            this.leftMenu = this.rightMenu.slice(0, l)
            this.rightMenu = this.rightMenu.slice(-l)
        },
        resetHighlight() {
            setTimeout(()=>{
                this.side ="normal"
            }, 500)
        },
        resetMenu() {
            let half = this.menu.length / 2;
            this.leftMenu = this.menu.slice(0, half)
            this.rightMenu = this.menu.slice(-half)
        },
        checkIfApiWorks() {
            if ('speechSynthesis' in window) {
                this.ttsApi = true
            } else {
                this.ttsApi = false
                alert("Sorry, your browser doesn't support text to speech!");
            } 
        },
        playSound(msg) {
            var tts = new SpeechSynthesisUtterance();
            tts.text = msg;
            window.speechSynthesis.speak(tts);

        }
    },
    mounted() {
        this.checkIfApiWorks();
        this.resetMenu()
        this.observer()
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>

</style>
