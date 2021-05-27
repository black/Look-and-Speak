import * as tf from '@tensorflow/tfjs'

const tensorflow = {
    install(Vue) {
        Vue.prototype.$tf = tf;
    }
}

export default tensorflow