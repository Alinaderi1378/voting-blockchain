const router = require('express').Router();
const hotelapi=require("./VoteRoutes");
/*
router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, x-auth-token, Content-Type, Accept'
    )
    res.header('x-auth-token', ' 3.2.1')
    next()
});

 */
router.use("/vote",hotelapi);
module.exports=router;