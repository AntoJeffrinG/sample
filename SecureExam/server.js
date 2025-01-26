const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('./db');
const fs = require('fs');
const path = require('path');
const { exec, execFile } = require('child_process');
const os = require('os');
const PORT = 3000;

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper functions for temporary directories
const createSessionDirectory = () => fs.mkdtempSync(path.join(os.tmpdir(), 'session-'));
const cleanup = (dir) => fs.existsSync(dir) && fs.rmSync(dir, { recursive: true, force: true });

// Language-specific execution functions
const runPython = (code, dir) => {
  const filePath = path.join(dir, 'temp_code.py');
  fs.writeFileSync(filePath, code);
  return new Promise((resolve, reject) => {
    exec(`python3 ${filePath}`, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
};

const runJava = (code, dir) => {
  const filePath = path.join(dir, 'Main.java');
  fs.writeFileSync(filePath, code);
  return new Promise((resolve, reject) => {
    exec(`javac ${filePath}`, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      exec(`java -cp ${dir} Main`, (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve(stdout);
      });
    });
  });
};

const runC = (code, dir) => {
  const filePath = path.join(dir, 'program.c');
  const executablePath = path.join(dir, 'program');
  fs.writeFileSync(filePath, code);
  return new Promise((resolve, reject) => {
    exec(`gcc ${filePath} -o ${executablePath}`, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      execFile(executablePath, (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve(stdout);
      });
    });
  });
};

const runCpp = (code, dir) => {
  const filePath = path.join(dir, 'program.cpp');
  const executablePath = path.join(dir, 'program');
  fs.writeFileSync(filePath, code);
  return new Promise((resolve, reject) => {
    exec(`g++ ${filePath} -o ${executablePath}`, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      execFile(executablePath, (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve(stdout);
      });
    });
  });
};

const runJavaScript = (code, dir) => {
  const filePath = path.join(dir, 'script.js');
  fs.writeFileSync(filePath, code);
  return new Promise((resolve, reject) => {
    exec(`node ${filePath}`, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
};

// Code execution endpoint
app.post('/run-code', async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ output: 'Error: Language and code are required.' });
  }

  const sessionDir = createSessionDirectory();

  try {
    let output;
    switch (language.toLowerCase()) {
      case 'python':
        output = await runPython(code, sessionDir);
        break;
      case 'java':
        output = await runJava(code, sessionDir);
        break;
      case 'c':
        output = await runC(code, sessionDir);
        break;
      case 'cpp':
        output = await runCpp(code, sessionDir);
        break;
      case 'javascript':
        output = await runJavaScript(code, sessionDir);
        break;
      default:
        output = 'Error: Unsupported language.';
    }
    res.json({ output });
  } catch (error) {
    res.status(500).json({ output: `Error: ${error}` });
  } finally {
    cleanup(sessionDir);
  }
});

// Login endpoint
app.post(
  '/login',
  [
    body('registerNumber').notEmpty().withMessage('Register number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { registerNumber, password } = req.body;
    console.log('Login Attempt:', { registerNumber, password });

    try {
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ registerNumber });

      if (!user || password !== user.password) {
        return res.status(401).json({ message: 'Invalid credentials!' });
      }
      res.json({ message: 'Login successful!' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: 'Internal server error!' });
    }
  }
);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('Failed to start server:', err);
  });