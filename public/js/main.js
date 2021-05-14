$(document).ready(function () {
    let currentModel;
    let traningState = false;

    let createModel = () => {
        const model = tf.sequential();
        let config_one = {
            kernelSize: 5,
            filters: 20,
            strides: 1,
            activation: 'relu',
            inputShape: [$('#eyes')[0].height, $('#eyes')[0].width, 3],
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
            optimizer: tf.train.adam(0.0005),
            loss: 'meanSquaredError',
        }
        model.compile(config_compile);
        return model;
    }


    const dataset = {
        train: {
            n: 0,
            x: null,
            y: null,
        },
        val: {
            n: 0,
            x: null,
            y: null,
        },
    }

    let collectData = (label) => {
        // Take the latest image from the eyes canvas and add it to our dataset.
        tf.tidy(function () {
            const image = getImage();
            const eyeDir = tf.tensor1d(label).expandDims(0);

            // Choose whether to add it to training (80%) or validation (20%) set:
            let dec = Math.random() > 0.2 ? 'train' : 'val'
            const subset = dataset[dec];
            // console.log("eyeDir", dec, subset);
            if (subset.x == null) {
                // Create new tensors
                subset.x = tf.keep(image);
                subset.y = tf.keep(eyeDir);
            } else {
                // Concatenate it to existing tensors
                const oldX = subset.x;
                const oldY = subset.y;
                subset.x = tf.keep(oldX.concat(image, 0));
                subset.y = tf.keep(oldY.concat(eyeDir, 0));
            }
            // Increase counter
            subset.n += 1;
        });
    }


    let fitModel = async () => {
        /*
        How this bactchSize works here in tensorflow.js?
        Why are we making batchSize like this?
        */
        let batchSize = Math.floor(dataset.train.n * 0.1);
        if (batchSize < 4) {
            batchSize = 4;
        } else if (batchSize > 64) {
            batchSize = 64;
        }

        if (currentModel == null) {
            currentModel = createModel();
        }

        await currentModel.fit(dataset.train.x, dataset.train.y, {
            batchSize: batchSize,
            epochs: 20,
            shuffle: true,
            validationData: [dataset.val.x, dataset.val.y],
            callbacks: {
                onTrainBegin: () => {
                    $('#modelFitting').removeClass("invisible");
                    console.log("Training Start");
                },
                onTrainEnd: () => {
                    $('#modelFitting').addClass("invisible");
                    console.log("Traing End");
                }
            }
        })
    }

    let predictData = () => {
        if (currentModel == null) {
            return;
        }

        tf.tidy(function () {
            const image = getImage();
            const prediction = currentModel.predict(image);
            prediction.data().then(prediction => {
                $('#startprediction').removeClass('invisible');
                /* 
                This would depend on how we design the output layer 
                */
                let idx = prediction.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
                console.log(idx, prediction)
                switch (idx) {
                    case 0:
                        $('.panels').removeClass("bg-primary");
                        $('#left').addClass("bg-primary")
                        break;
                    case 1:
                        $('.panels').removeClass("bg-primary");
                        break;
                    case 2:
                        $('.panels').removeClass("bg-primary");
                        $('#right').addClass("bg-primary")
                        break;
                }
            });
        });
    }

    function getImage() {
        // Capture the current image in the eyes canvas as a tensor.
        return tf.tidy(function () {

            // var ff = new Image();
            // ff.id = "pic";
            // ff.src = $('#eyes')[0];
            // document.getElementById('image_for_crop').appendChild(ff);

            console.log($('#eyes')[0])

            const image = tf.browser.fromPixels($('#eyes')[0]);
            // console.log("image", image.shape, image);
            // Add a batch dimension:
            const batchedImage = image.expandDims(0);
            // console.log("batchedImage", batchedImage.shape, batchedImage);
            // Normalize and return it:
            const norm = batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
            // console.log("mormalized", norm)
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
                collectData([1, 0, 0]);
                console.log("left");
                break;
            case 39:
                collectData([0, 0, 1]);
                console.log("right");
                break;
            default:
                collectData([0, 1, 0]);
                console.log("normal");
                break;
        }
        event.preventDefault();
        return false;
    });

    //Start Data Collection
    $('#startDataCollection').on('click', function () {
        traningState = !traningState;
        $('#data-collection').toggleClass("invisible")
        console.log("Collecting Data");
    });

    //Start Model training
    $('#modelFitting').on('click', function () {
        fitModel();
        console.log("Training model");
    });

    // Start Prediction
    $('#startprediction').on('click', function () {
        predictData();
        setInterval(predictData, 100);
        console.log("Starting Prediction");
    });
});