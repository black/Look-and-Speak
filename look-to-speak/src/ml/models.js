"use strict"

import * as tf from '@tensorflow/tfjs'

export default class EyeModel {
    constructor(elm) {
        this.model = tf.sequential();
        this.imageArray = []
        this.labelArray = []
        this.elm = elm
    }

    createModel(w, h, ch) {
        let config_one = {
            kernelSize: 3,
            filters: 20,
            strides: 1,
            activation: 'relu',
            inputShape: [h, w, ch]
        }
        this.model.add(tf.layers.conv2d(config_one));

        let config_two = {
            poolSize: [2, 2],
            strides: [2, 2],
        }
        this.model.add(tf.layers.maxPooling2d(config_two));

        // add more layers
        let config_three = {
            kernelSize: 5,
            filters: 16,
            strides: 1,
            activation: 'relu',
        }
        this.model.add(tf.layers.conv2d(config_three));

        let config_four = {
            poolSize: [2, 2],
            strides: [2, 2],
        }
        this.model.add(tf.layers.maxPooling2d(config_four));


        this.model.add(tf.layers.flatten());
        // model.add(tf.layers.dropout(0.2)); / no need becuase we don't know if the model is overfitting.

        // Two output values x and y
        let congfig_output = {
            units: 3,
            activation: 'softmax',
        }
        this.model.add(tf.layers.dense(congfig_output));

        // Use ADAM optimizer with learning rate of 0.0005 and MSE loss
        const LEARNING_RATE = 0.0005;
        const optimizer = tf.train.adam(LEARNING_RATE);
        let config_compile = {
            optimizer: optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        }
        this.model.compile(config_compile);
        // this.model.summary();
    }

    resetModel() {
        tf.dispose(this.model);
        this.model = tf.sequential();
    }

    trainModel() {
        let imageSet = tf.tidy(() => {
            const imgset = tf.concat(this.imageArray);
            return imgset;
        });
        let labelSet = tf.oneHot(tf.tensor1d(this.labelArray, 'int32'), 3);

        this.model.fit(imageSet, labelSet, {
            batchSize: 10,
            epochs: 10,
            shuffle: true,
            validationSplit: 0.1,
            callbacks: {
                onTrainBegin: () => console.log("Training Start"),
                onTrainEnd: () => console.log("Traing End"),
                onEpochEnd: (epoch, logs) => {
                    console.log("Epoch-->", epoch, logs)
                }
            }
        })
    }

    predict(el, callback) {
        tf.tidy(() => {
            const prediction = this.model.predict(this.getImage(el));
            prediction.data().then(pred => {
                console.log('prediction', pred);
                const max = Math.max.apply(Math, pred.map((i) => i));
                const maxIndex = pred.indexOf(max);
                callback(maxIndex)
                // switch (maxIndex) {
                //     case 0:
                //         console.log("left");
                //         $('.panels').removeClass('bg-primary')
                //         $('#left').addClass('bg-primary')
                //         break;
                //     case 1:
                //         console.log("normal");
                //         $('.panels').removeClass('bg-primary')
                //         $('#normal').addClass('bg-primary')
                //     case 2:
                //         console.log("right");
                //         $('.panels').removeClass('bg-primary')
                //         $('#right').addClass('bg-primary')
                // }
            })
        });
    }

    collectData(el, label) {
        const img = tf.tidy(() => {
            const captureImg = this.getImage(el);
            //console.log(captureImg.shape)
            return captureImg;
        })
        this.imageArray.push(img)
        this.labelArray.push(label) //--- labels are 0,1,2
    }

    getImage(el) {
        return tf.tidy(function () {
            const image = tf.browser.fromPixels(el);
            const batchedImage = image.expandDims(0);
            const norm = batchedImage.toFloat().div(tf.scalar(255)).sub(tf.scalar(1));
            return norm;
        });
    }
}