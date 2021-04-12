const express = require('express');
const app = express();
const cors = require('cors');
const config = require('./config.json')
const dbService = require('./dbService')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

//search route
app.get('/search/:input', (request, response) => {

    const { input } = request.params;
    const db = dbService.getDBServiceInstance();
 
    const result = db.search(input);
    result
    .then(data => 
        response.json({data:data}))
    .catch(err => console.log(err));  
});


app.listen(config.PORT,'0.0.0.0', () => console.log('app is running'));
