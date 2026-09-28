const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Clave incorrecta.' });
  }
  const token = jwt.sign({ finca: 'amaro' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
};
