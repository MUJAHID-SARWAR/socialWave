import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcryptjs.genSalt();
    const passwordHash = await bcryptjs.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request received:', { email, password }); // Log request data

    const user = await User.findOne({ email: email });
    if (!user) {
      console.error('User does not exist:', email);
      return res.status(400).json({ msg: "User does not exist." });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      console.error('Invalid credentials for user:', email);
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;

    console.log('User authenticated successfully:', { user, token }); // Log successful response
    res.status(200).json({ token, user });
  } catch (err) {
    console.error('Error during login:', err); // Log any errors
    res.status(500).json({ error: err.message });
  }
};
