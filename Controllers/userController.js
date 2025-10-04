const userModel = require("../Models/user");

// Create a new user
exports.register = async (req, res) => {
  try {
    const { email, name, photoUrl } = req.body;
    const userExist = await userModel.findOne({ email: email });
    if (!userExist) {
      let newUser = new userModel({ name, email, photoUrl });
      await newUser.save();
      return res.status(201).send({ message: "User Registered Successfully", user: newUser });
    }
    return res.status(200).send({ message: "Welcome Back User Already Exists", user: userExist });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
};
