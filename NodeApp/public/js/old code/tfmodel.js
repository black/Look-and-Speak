let createModel;

function createModel() {
    const model = tf.sequential();


    // Hidden layers 1
    let configHidden1 = {
        kernelSize: 5,
        filters: 20,
        strides: 1,
        activation: 'relu',
        inputShape: [$('#eyes').height(), $('#eyes').width(), 3],
    }
    model.add(tf.layers.conv2d(configHidden1));

    // Hidden layer 2
    let configHidden2 = {
        poolSize: [2, 2],
        strides: [2, 2],
    }
    model.add(tf.layers.maxPooling2d(configHidden2));

    model.add(tf.layers.flatten());
    model.add(tf.layers.dropout(0.2));

    // Output layer
    let configOutput = {
        units: 1,
        activation: 'tanh',
    }
    model.add(tf.layers.dense(configOutput));

    // Use ADAM optimizer with learning rate of 0.0005 and MSE loss
    model.compile({
        optimizer: tf.train.adam(0.0005),
        loss: 'meanSquaredError',
    });
    return model;
}