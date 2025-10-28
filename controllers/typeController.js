// const type = require('../models/Type');

// // @desc    Get all types
// // @route   GET /api/types
// const gettypes = async (req, res) => {
//   try {
//     const types = await type.find();
//     res.json(types);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Create a type
// // @route   POST /api/types
// const createtype = async (req, res) => {
//   try {
//     const { name, logo } = req.body;
//     const type = new Type({ name, logo });
//     const savedtype = await type.save();
//     res.status(201).json(savedtype);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = {
//   gettypes,
//   createtype
// };