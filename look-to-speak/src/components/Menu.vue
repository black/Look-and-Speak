<template>
<div class="flex flex-col p-10 gap-5 bg-green-800">
    <div class="p-3 text-green-100 bg-green-500 rounded">
        <span>TTS is {{ttsApi?"Supported":"Not Supported"}}</span>
    </div>
    <div class="grid grid-cols-5 h-full gap-3">
        <div @click="leftSelect()" class="rounded text-center bg-green-100 p-5 col-span-2">
            <ul>
                <li v-for="item in leftMenu" :key="item">{{item}}</li>
            </ul>
        </div>
        <div class="rounded text-center bg-green-100 p-5 col-span-1">Normal</div>
        <div @click="rightSelect()" class="rounded text-center bg-green-100 p-5 col-span-2">
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
            menu: ["Apple", "Orange", "Banana", "Papaya", "Red", "Blue", "Green", "Black"],
            leftMenu: [],
            rightMenu: [],
            ttsApi: false
        }
    },
    methods: {
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
            console.log(l, this.leftMenu, this.rightMenu)
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
        resetMenu() {
            this.leftMenu = this.menu.slice(0, this.menu.length / 2)
            this.rightMenu = this.menu.slice(-this.menu.length / 2)
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
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>

</style>
