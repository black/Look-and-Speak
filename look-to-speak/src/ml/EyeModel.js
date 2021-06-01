import * as tf from '@tensorflow/tfjs'

export default class EyeModel {

    createModel(w, h, ch) {
        this.model = tf.sequential();
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
    }

    resetModel() {
        tf.dispose(this.model);
        this.model = tf.sequential();
    }

    trainModel(imageArray, labelArray) {
        // this.model.summary();
        // let newArray = imageArray
        // console.log('-->', newArray.toString(), labelArray.toString());
        console.log("tet", imageArray, labelArray)

        let imageSet = tf.tidy(function () {
            let im = tf.stack(imageArray)
            return im;
        });
        console.log(imageSet);
        // let labelSet = tf.oneHot(tf.tensor1d(labelArray, 'int32'), 3);

        // console.log(imageSet.size, labelSet.size, tf.memory())

        // await this.model.fit(imageSet, labelSet, {
        //     batchSize: 2,
        //     epochs: 10,
        //     shuffle: true,
        //     validationSplit: 0.1,
        //     callbacks: {
        //         onTrainBegin: () => console.log("Training Start"),
        //         onTrainEnd: () => console.log("Traing End"),
        //         onEpochEnd: (epoch, logs) => {
        //             console.log(epoch, logs)
        //         }
        //     }
        // })
        // tf.dispose([imageArray, labelArray]);
    }

    predict(data, callback) {
        tf.tidy(() => {
            const prediction = this.model.predict(data);
            prediction.data().then(pred => {
                console.log('prediction', pred);
                const max = Math.max.apply(Math, pred.map((i) => i));
                const maxIndex = pred.indexOf(max);
                callback(maxIndex)
            })
        });
    }
}