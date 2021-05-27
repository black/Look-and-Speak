import jquery from 'jquery'

const jq = {
    install(Vue) {
        Vue.prototype.$j = jquery;
    }
}

export default jq