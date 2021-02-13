const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auththentication');

const router = express.Router();

router.post('/tasks', auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    author: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send();
  }
});

//Get tasks?completed=true
//GET limit and skip
//Get /task?sortBy=createAt_asc
router.get('/tasks', auth, async (req, res) => {
  try {
    let task;
    let parts;
    let sort;
    if (req.query.sortBy) {
      parts = req.query.sortBy.split(':');
      sort = parts[1] === 'asc' ? parts[0] : `-${parts[0]}`;
    }
    if (req.query.completed) {
      const completed = req.query.completed === 'true';
      task = await Task.find({
        author: req.user._id,
        completed,
      })
        .skip(parseInt(req.query.skip))
        .limit(parseInt(req.query.limit))
        .sort(`${sort ? sort : ''}`);
    } else {
      task = await Task.find({ author: req.user._id })
        .skip(parseInt(req.query.skip))
        .limit(parseInt(req.query.limit))
        .sort(`${sort ? sort : ''}`);
    }
    // await req.user.find().populate('tasks').execPopulate;
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send();
  }
});
router.get('/tasks/:id', auth, async (req, res) => {
  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send();
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['completed', 'description'];
  const isValid = updates.every((element) =>
    allowedUpdates.includes(element.toLowerCase())
  );
  if (!isValid) {
    return res.status(400).send();
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   runValidators: true,
    //   new: true,
    // });

    res.send(task);
  } catch (error) {
    res.status(404).send();
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!task) {
      res.status(404).send();
    }
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
