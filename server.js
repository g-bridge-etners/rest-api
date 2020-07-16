const express = require('express');


const config = require('./config.js');
const PORT = config.TEST_PORT;




const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());





app.use('/auth', require('./routes/api/auth.js'));
app.use('/commute', require('./routes/api/commute.js'));



app.listen(PORT, () => {
    console.log(`Server Run ::${PORT}`);
})
