const router = require("express").Router();
const { getTicket } = require("../controllers/registrationController");

router.get("/:qrToken", getTicket);

module.exports = router;
