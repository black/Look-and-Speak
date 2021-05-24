/*

1. how to find proper combitnation of activation function in input and output layer
2. How to choose loss function 
3. How to chosse learning rate
4. How to decide the batchsize
5. How to choose number of epochs

*/


$(document).ready(function () {
    let currentModel;
    let traningState = false;

    let imageWidth = $('#eyes')[0].width;
    let imageHeight = $('#eyes')[0].height;
    let imageChannels = 3;

    let createModel = () => {
        const model = tf.sequential();
        let config_one = {
            kernelSize: 3,
            filters: 40,
            strides: 1,
            activation: 'relu',
            inputShape: [imageHeight, imageWidth, imageChannels]
        }
        model.add(tf.layers.conv2d(config_one));

        let config_two = {
            poolSize: [2, 2],
            strides: [2, 2],
        }
        model.add(tf.layers.maxPooling2d(config_two));

        model.add(tf.layers.flatten());
        model.add(tf.layers.dropout(0.2));

        // Two output values x and y
        let congfig_output = {
            units: 3,
            activation: 'tanh',
        }
        model.add(tf.layers.dense(congfig_output));

        // Use ADAM optimizer with learning rate of 0.0005 and MSE loss
        let config_compile = {
            optimizer: tf.train.adam(0.000005),
            loss: 'categoricalCrossentropy',
        }
        model.compile(config_compile);

        tf.memory()

        return model;
    }


    let imageArray = [];
    let labelArray = [];

    let collectData = (label) => {
        const img = tf.tidy(() => {
            const captureImg = getImage();
            //console.log(captureImg.shape)
            return captureImg;
        })
        imageArray.push(img)
        labelArray.push(label) //--- labels are 0,1,2
    }


    let fitModel = async () => {
        let imageSet = tf.concat(imageArray);
        let labelSet = tf.oneHot(tf.tensor1d(labelArray, 'int32'), 3);

        if (currentModel == null) {
            currentModel = createModel();
            currentModel.summary();
        }

        await currentModel.fit(imageSet, labelSet, {
            batchSize: 2,
            epochs: 10,
            shuffle: true,
            validationSplit: 0.2,
            callbacks: {
                onTrainBegin: () => console.log("Training Start"),
                onTrainEnd: () => console.log("Traing End"),
                onBatchEnd: async (batch, log) => {
                    // await tf.nextFrame();
                    console.log(batch, log)
                }
            }
        })
    }

    let predictData = () => {
        if (currentModel == null) {
            return;
        }

        tf.tidy(() => {
            const image = getImage();
            const prediction = currentModel.predict(image);
            prediction.data().then(pred => {
                console.log('prediction', pred);
                const max = Math.max.apply(Math, pred.map((i) => i));
                const maxIndex = pred.indexOf(max);
                switch (maxIndex) {
                    case 0:
                        console.log("left");
                        $('.panels').removeClass('bg-primary')
                        $('#left').addClass('bg-primary')
                        break;
                    case 1:
                        console.log("normal");
                        $('.panels').removeClass('bg-primary')
                        $('#normal').addClass('bg-primary')
                    case 2:
                        console.log("right");
                        $('.panels').removeClass('bg-primary')
                        $('#right').addClass('bg-primary')
                }
            })
        });
    }

    function getImage() {
        return tf.tidy(function () {
            const image = tf.browser.fromPixels($('#eyes')[0]);
            const batchedImage = image.expandDims(0);
            const norm = batchedImage.toFloat().div(tf.scalar(255)).sub(tf.scalar(1));
            return norm;
        });
    }

    /********** Camera Data **********/

    // intialize all elements
    const video = $('#webcam')[0]; /// video container
    const overlay = $('#overlay')[0]; //canvas overlay
    const overlayCC = overlay.getContext('2d'); // canvas context
    const ctrack = new clm.tracker(); // face tracker
    ctrack.init(); // initiakzling tracker

    /*Streaming video navigator*/
    navigator.mediaDevices.getUserMedia({
        video: true
    }).then(onStreaming);

    function trackingLoop() {
        // Check if a face is detected, and if so, track it.
        requestAnimationFrame(trackingLoop);

        let currentPosition = ctrack.getCurrentPosition();
        overlayCC.clearRect(0, 0, 400, 300);

        if (currentPosition) {
            ctrack.draw(overlay);
            // // Get the eyes rectangle and draw it in red:
            const eyesRect = getEyesRectangle(currentPosition);
            overlayCC.strokeStyle = 'red';
            overlayCC.strokeRect(eyesRect[0], eyesRect[1], eyesRect[2], eyesRect[3]);

            // The video might internally have a different size, so we need these
            // factors to rescale the eyes rectangle before cropping:
            const resizeFactorX = video.videoWidth / video.width;
            const resizeFactorY = video.videoHeight / video.height;

            // // Crop the eyes from the video and paste them in the eyes canvas:
            const eyesCanvas = $('#eyes')[0];
            const eyesCC = eyesCanvas.getContext('2d');

            eyesCC.drawImage(
                video,
                eyesRect[0] * resizeFactorX, eyesRect[1] * resizeFactorY,
                eyesRect[2] * resizeFactorX, eyesRect[3] * resizeFactorY,
                0, 0, eyesCanvas.width, eyesCanvas.height
            );
        }
    }

    function onStreaming(stream) {
        video.srcObject = stream;
        /*start face tracking*/
        ctrack.start(video);
        /*draw on face tracking*/
        trackingLoop();
    }



    /***methods to enable-------------------/
    /*Capture image near the eye*/
    function getEyesRectangle(positions) {
        const minX = positions[23][0] - 5;
        const maxX = positions[28][0] + 5;
        const minY = positions[24][1] - 5;
        const maxY = positions[26][1] + 5;
        const width = maxX - minX;
        const height = maxY - minY;
        return [minX, minY, width, height];
    }

    // Start Data Collection
    $('body').keydown(function (event) {
        if (traningState == false) {
            console.log("Enable Traning");
            return
        }
        switch (event.keyCode) {
            case 37:
                collectData(0);
                console.log("left");
                break;
            case 39:
                collectData(2);
                console.log("right");
                break;
            default:
                collectData(1);
                console.log("normal");
                break;
        }
        event.preventDefault();
        return false;
    });

    //Start Data Collection
    $('#startDataCollection').on('click', function () {
        traningState = !traningState;
        $(this).find('.progress-bar').toggleClass("progress-bar-striped progress-bar-animated");
        if (!traningState) {
            //console.log(dataset)
        }
    });

    //Start Model training
    $('#modelFitting').on('click', function () {
        $(this).find('.progress-bar').toggleClass("progress-bar-striped progress-bar-animated");
        fitModel().then(results => {
            $(this).find('.progress-bar').toggleClass("progress-bar-striped progress-bar-animated")
            console.log("Traing End");
        });
    });

    // Start Prediction
    $('#startprediction').on('click', function () {
        $(this).find('.progress-bar').toggleClass("progress-bar-striped progress-bar-animated");
        predictData();
        setInterval(predictData, 100);
    });
});



/*Erros identified*/
/* the Array of Tensors that you are passing to your model is not the size the model expected
https: //stackoverflow.com/questions/54828883/error-when-checking-model-input-the-array-of-tensors-that-you-are-passing-to-yo

// Expected convolution2d_input_1 to have 4 dimensions, but got array with shape error in keras
https: //stackoverflow.com/questions/52718451/expected-conv2d-1-input-to-have-4-dimensions-but-got-array-with-shape-15936-6

// new error
All tensors passed to stack must have matching shapes Shapes 1, 150, 300, 3 and must match

// expected conv2d_Conv2D1_input to have 4 dimension(s).but got array with shape 15, 1, 150, 300, 3
*/