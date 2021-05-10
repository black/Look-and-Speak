let createModel;

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