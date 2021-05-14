$(document).ready(function () {

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

    // Capture tranining data

    $('body').keydown(function (event) {
        switch (event.keyCode) {
            case 37:
                dataCollection([1, 0, 0]);
                //console.log("left");
                break;
            case 39:
                dataCollection([0, 0, 1]);
                // console.log("right");
                break;
            default:
                dataCollection([0, 1, 0]);
                // console.log("normal");
                break;
        }
        event.preventDefault();
        return false;
    });

    let currentModel;

    function createModel() {
        const model = tf.sequential();
        model.add(tf.layers.conv2d({
            kernelSize: 5,
            filters: 20,
            strides: 1,
            activation: 'relu',
            inputShape: [$('#eyes').height(), $('#eyes').width(), 3],
        }));

        model.add(tf.layers.maxPooling2d({
            poolSize: [2, 2],
            strides: [2, 2],
        }));

        model.add(tf.layers.flatten());

        model.add(tf.layers.dropout(0.2));

        // Two output values x and y
        model.add(tf.layers.dense({
            units: 3,
            activation: 'tanh',
        }));

        // Use ADAM optimizer with learning rate of 0.0005 and MSE loss
        model.compile({
            optimizer: tf.train.adam(0.0005),
            loss: 'meanSquaredError',
        });
        return model;
    }


    $('#startTraning').on('click', function () {
        startTraining();
        //console.log("Traning Started...");
    });

    function startTraining() {

    }


    $('#modelFitting').on('click', function () {
        fitModel();
        // console.log("fitting model...");
        $('#training').show();
    });

    async function fitModel() {
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
                    $('#training').removeClass("d-none");
                    console.log("Training Start");
                },
                onTrainEnd: () => {
                    $('#training').addClass("d-none");
                    console.log("Traing End");
                }
            }
        })
    }


    $('#startprediction').on('click', function () {
        startPrediction();
        setInterval(startPrediction, 100);
        console.log("starting prediction ...");
    });

    // predict with the eye image
    function startPrediction() {
        if (currentModel == null) {
            return;
        }

        tf.tidy(function () {
            const image = getImage();
            const prediction = currentModel.predict(image);
            // It's okay to run this async, since we don't have to wait for it.
            prediction.data().then(prediction => {
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

    // Get the image from the eye canvas
    function getImage() {
        // Capture the current image in the eyes canvas as a tensor.
        return tf.tidy(function () {
            const image = tf.browser.fromPixels($('#eyes')[0]);
            // Add a batch dimension:
            const batchedImage = image.expandDims(0);
            // Normalize and return it:
            return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
        });
    }

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

    /************************************************************************************/
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
    /*
        where 
        n = data index
        x = image
        y = lable
    */
    function dataCollection(side) {
        // Take the latest image from the eyes canvas and add it to our dataset.
        tf.tidy(function () {
            const image = getImage();
            const eyeDir = tf.tensor1d(side).expandDims(0);

            // Choose whether to add it to training (80%) or validation (20%) set:
            let dec = Math.random() > 0.2 ? 'train' : 'val'
            const subset = dataset[dec];
            console.log("eyeDir", dec, subset);
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
});