const router = require("express").Router();
const c = require("../controllers/classController");

router.post("/", c.createClass);
router.post("/:id/attend", c.attend);
router.get("/:id/qr", c.requireHost, c.getQr);
router.get("/:id/attendance", c.requireHost, c.getAttendance);
router.post("/:id/end", c.requireHost, c.endClass);

module.exports = router;
