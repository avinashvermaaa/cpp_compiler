const express = require("express"); // Import Express framework
const bodyParser = require("body-parser"); // Middleware for parsing request bodies
const cors = require("cors"); // Middleware to enable CORS
const { exec, spawn } = require("child_process"); // Used to execute shell commands and run processes
const fs = require("fs"); // File system module for handling files
const path = require("path"); // Module to handle file paths
const { v4: uuidv4 } = require("uuid"); // UUID generator to create unique file names

const app = express(); // Initialize Express app
const port = process.env.PORT || 3000; // Use dynamic port for Render, default to 3000

// Enable CORS and JSON body parsing
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON request bodies

// API endpoint to compile and execute C++ code
app.post("/compile", (req, res) => {
  // Changed from "/run" to "/compile" for consistency
  const { code, input } = req.body;
  if (!code) {
    return res.status(400).json({ error: "No code provided." });
  }

  const uniqueId = uuidv4();
  const filePath = path.join(__dirname, `temp_${uniqueId}.cpp`);
  const outputPath = path.join(__dirname, `temp_${uniqueId}.out`);

  try {
    fs.writeFileSync(filePath, code);

    exec(`g++ "${filePath}" -o "${outputPath}"`, (err, stdout, stderr) => {
      if (err) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: stderr || "Compilation error." });
      }

      const process = spawn(outputPath);

      if (input) {
        process.stdin.write(input + "\n");
        process.stdin.end();
      }

      let output = "";
      let errorOutput = "";

      process.stdout.on("data", (data) => {
        output += data.toString();
      });

      process.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      process.on("close", (code) => {
        fs.unlinkSync(filePath);
        fs.unlinkSync(outputPath);

        if (code !== 0) {
          return res
            .status(400)
            .json({ error: errorOutput || "Runtime error" });
        }

        res.json({ output });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
