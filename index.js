const express = require('express'); 
const app = express(); 
const path = require('path');
const myRoutes = require("./server/routes/myroutes"); //gives us access to all of our routes in myroutes

//CORS middleware 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header("Access-Control-Allow-Headers", "GET, POST, PUT, DELETE, OPTIONS"); 
    next(); 
})

app.use("/", myRoutes); //What we will call on our front end when using fetch and making http requests

app.get('*', function(req, res) {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
});

const PORT = process.env.PORT || 3000; //A communication endpoint. Can be accessed 
// through http://localhost:3000. 

//Starts our server 
app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
