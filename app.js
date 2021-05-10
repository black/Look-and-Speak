const express = require('express'),
    app = express(),
    server = app.listen(1000, () => {
        console.log("server running...1000");
    });

app.use(express.static('public'));