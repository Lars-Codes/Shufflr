const express = require('express');
const router = express.Router(); 

router.get('/test', async (req, res) => {
    try {
        const test = "hello world"
        res.send(test)
    } catch(err){
        res.status(401).send({message: error.message});
    }
});

module.exports = router; 