const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const router = require('express').Router();
const Task = require('../models/Task');

// 🔥 ADMIN creates task & assign
router.post('/', auth, admin, async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
});

// 🔥 USER gets only their tasks
router.get('/', auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      // 🔥 ADMIN = SAB TASKS
      tasks = await Task.find();
    } else {
      // 👨‍💻 MEMBER = SIRF APNE
      tasks = await Task.find({ assignedTo: req.user.email });
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update
router.put('/:id', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

// delete
router.delete('/:id', auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

module.exports = router;