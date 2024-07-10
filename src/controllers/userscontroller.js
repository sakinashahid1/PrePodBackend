const User = require("../models/User");
const Client = require("../models/Client")
// const CryptoJS = require("crypto-js");
// const secretKey = process.env.SECRET_KEY;

// function encryptPassword(password) {
//   const keySize = 256 / 32;
//   return CryptoJS.AES.encrypt(password, secretKey, { keySize: keySize }).toString();
// }

// async function signup(req, res) {
//   try {
//     const {
//       name,
//       email,
//       mobile_no,
//       country,
//       password,
//       confirm_password,
//       client_id,
//       role
//     } = req.body;

//     if (password !== confirm_password) {
//       return res
//         .status(400)
//         .json({ message: "Password and confirm password do not match" });
//     }

//     const client = await Client.findOne({ client_id });
//     if (!client) {
//       return res.status(400).json({ message: "This Company Does Not exist" });
//     }

//     if (client.rootAccountCreated > 0) {
//       console.log("root key repeated");
//       return res.status(400).json({ message: "Signup key has already been used" });
//     }

//     const encryptedPassword = encryptPassword(password);
//     const user = new User({
//       name,
//       email,
//       mobile_no,
//       country,
//       role,
//       password: encryptedPassword,
//       company_name: client.company_name,
//     });

//     await user.save();

//     await Client.updateOne({ _id: client._id }, { rootAccountCreated: 1 });

//     res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// function decryptPassword(encryptedPassword) {
//   try {
//     const keySize = 256 / 32;
//     const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey, { keySize: keySize });
//     return bytes.toString(CryptoJS.enc.Utf8);
//   } catch (error) {
//     console.error("Error decrypting password:", error);
//     return "";
//   }
// }

// async function getLoginCredentials(req, res) {
//   try {
//     const { company_name } = req.query;

//     const user = await User.findOne({ company_name }, 'email password');
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const decryptedPassword = decryptPassword(user.password);
//     res.status(200).json({ email: user.email, password: decryptedPassword });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

async function getUsers(req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUser(req, res) {
  try {
    const { id, name, email, mobile_no, country, company_name } = req.body;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) {
      existingUser.name = name;
    }

    if (email) {
      existingUser.email = email;
    }

    if (mobile_no) {
      existingUser.mobile_no = mobile_no;
    }

    if (country) {
      existingUser.country = country;
    }

    if (company_name) {
      existingUser.company_name = company_name;
    }

    const updatedUser = await existingUser.save();

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function userDetails(req, res) {
  try {
    const { id } = req.query;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const UserDetails = {
      name: user.name,
      email: user.email,
      mobile_no: user.mobile_no,
      country: user.country,
      role: user.role,
      company_name: user.company_name,
    };

    res.json(UserDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function userShortcut(req, res) {
  try {
    const shortcutsData = req.body.shortcuts;
    const userRole = req.user.role;

    const user = await User.findOne({ role: userRole });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!shortcutsData || !Array.isArray(shortcutsData) || shortcutsData.length === 0) {
      return res.status(400).json({ message: "No shortcuts provided" });
    }

    const existingShortcuts = user.shortcuts || [];
    shortcutsData.forEach(({ id, shortcut, edited_name }) => {
      existingShortcuts.push({ id, shortcut, edited_name });
    });

    user.shortcuts = existingShortcuts;

    await user.save();

    res.status(200).json({ message: "Shortcuts saved successfully", shortcuts: existingShortcuts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getUserShortcuts(req, res) {
  try {
    const userRole = req.user.role;

    const user = await User.findOne({ role: userRole });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const shortcuts = user.shortcuts.map(({ id, shortcut, edited_name }) => ({
      id,
      shortcut,
      edited_name
    }));

    res.status(200).json({ shortcuts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteUserShortcuts(req, res) {
  try {
    const { id } = req.query;
    const userRole = req.user.role;

    const user = await User.findOne({ role: userRole });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.shortcuts.findIndex(shortcut => shortcut.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Shortcut not found" });
    }

    user.shortcuts.splice(index, 1);

    await user.save();

    res.status(200).json({ message: "Shortcut deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getUsers, updateUser, userDetails, userShortcut, getUserShortcuts, deleteUserShortcuts };
