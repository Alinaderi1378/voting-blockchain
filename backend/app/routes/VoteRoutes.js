const router = require('express').Router();
const multer = require("multer");
const voterController=require("../http/controller/VoterController");
const Auth=require("../http/middleware/Auth");
router.post('/',voterController.signup);
router.post('/candidates',voterController.addcondidates);
router.post('/vote',voterController.votesign);
router.put('/:natinalId',voterController.updatevoter);
 // router.post('/auth',hotelController.create);
router.get("/candidates",voterController.getcondidates);
router.get("/winner",voterController.getWinner);
router.post("/condidate",voterController.getcondidate);
router.post("/to",voterController.getvotervote);
router.get("/vcount",voterController.getvoterCount);
/*




// rooms routers
router.get("/voter/:address",[Auth,hotelAdmin],hotelController.getListroom);
// menu routers
router.get("/menu",[Auth,hotelAdmin],hotelController.getListFood);
*/



module.exports=router;