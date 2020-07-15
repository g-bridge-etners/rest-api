const express = require('express');


const config = require('./config.js');
const PORT = config.PORT;




const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());





app.use('/auth', require('./routes/api/auth.js'));




app.listen(PORT, () => {
    console.log(`Server Run ::${PORT}`);
})
