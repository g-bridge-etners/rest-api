// 모듈
const express = require('express');

// CONFIG
const config = require('./config.js');

// 라우터
const test = require('./routes/test.js');


const app = express();
const PORT = config.port;


app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());

app.use('/test', test);

app.listen(PORT, () => {
    console.log(`Server Run ::${PORT}`);
})
