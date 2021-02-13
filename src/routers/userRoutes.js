const express = require('express');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auththentication');
const multer = require('multer');
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account');

const router = express.Router();

const upload = multer({
  // dest: 'avatar',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File must be an image'));
    }

    cb(undefined, true);
  },
});
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

//Upload Files
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//Delete Uploads
router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(400).send();
  }
});

//Fetch Uploaded Image
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-type', 'image/png'); //More on Content types
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
  // try {
  //   const users = await User.find({});
  //   if (!users) {
  //     return res.status(404).send();
  //   }
  //   res.send(users);
  // } catch (error) {
  //   res.status(500).send();
  // }
});
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// router.get('/users/:id', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.status(200).send(user);
//   } catch (error) {
//     res.status(400).send();
//   }
// });

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['age', 'name', 'email', 'password'];
  const isValid = updates.every((element) =>
    allowedUpdates.includes(element.toLowerCase())
  );
  if (!isValid) {
    return res.status(400).send();
  }
  try {
    // const user = await User.findById(req.params.id);
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // }); //-------> Changed For password validation using middleware
    // if (!user) {
    //   return res.status(404).send();
    // }
    res.send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // // if (!user) {
    // //   res.status(404).send();
    // // }
    req.user.remove();
    sendGoodbyeEmail(req.user.email, req.user.name);
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});
module.exports = router;
