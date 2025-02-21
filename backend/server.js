const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.post("/run", (req, res) => {
  const { code, input } = req.body; // Receive both code and input from frontend

  const filePath = path.join(__dirname, "temp.cpp");
  const outputPath = path.join(__dirname, "temp.out");

  fs.writeFileSync(filePath, code);

  // Compile the C++ code
  exec(`g++ "${filePath}" -o "${outputPath}"`, (err, stdout, stderr) => {
    if (err) {
      return res.status(400).json({ error: stderr || "Compilation error" });
    }

    // Run the compiled executable and provide input
    const process = spawn(outputPath);

    process.stdin.write(input + "\n"); // Send input to the C++ program
    process.stdin.end();

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process.on("close", (code) => {
      fs.unlinkSync(filePath); // Remove temp.cpp
      fs.unlinkSync(outputPath); // Remove temp.out

      if (code !== 0) {
        return res.status(400).json({ error: errorOutput || "Runtime error" });
      }

      res.json({ output });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
