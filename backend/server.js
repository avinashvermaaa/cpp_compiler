const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.post("/run", (req, res) => {
  const code = req.body.code;

  if (!code) {
    return res.status(400).json({ error: "No code provided." });
  }

  const uniqueId = uuidv4(); // Generate unique identifier
  const filePath = path.join(__dirname, `temp_${uniqueId}.cpp`);
  const outputFile = path.join(__dirname, `temp_${uniqueId}.out`);

  try {
    fs.writeFileSync(filePath, code);

    // Compile the C++ code
    exec(`g++ "${filePath}" -o "${outputFile}"`, (err, stdout, stderr) => {
      if (err) {
        fs.unlinkSync(filePath); // Cleanup source file
        return res.status(400).json({ error: stderr || "Compilation error." });
      }

      // Run the compiled program with timeout to prevent infinite loops
      exec(
        `"${outputFile}"`,
        { timeout: 5000 },
        (runErr, runStdout, runStderr) => {
          fs.unlinkSync(filePath);
          fs.unlinkSync(outputFile);

          if (runErr) {
            return res
              .status(400)
              .json({ error: runStderr || "Execution error." });
          }

          res.json({ output: runStdout });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
