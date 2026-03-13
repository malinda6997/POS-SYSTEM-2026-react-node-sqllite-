const { db } = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.login = (req, res) => {
  const { username, password } = req.body;

  try {
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) return res.status(404).json({ message: "Invalid username or password" });


    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid username or password" });


    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.register = (req, res) => {
  const { username, password, role, full_name } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const stmt = db.prepare(
      "INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)",
    );
    stmt.run(username, hashedPassword, role, full_name);
    res.json({ message: "User created successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists!" });
  }
};
