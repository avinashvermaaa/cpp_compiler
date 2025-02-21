const express = require("express"); // Import Express framework
const bodyParser = require("body-parser"); // Middleware for parsing request bodies
const cors = require("cors"); // Middleware to enable CORS
const { exec, spawn } = require("child_process"); // Used to execute shell commands and run processes
const fs = require("fs"); // File system module for handling files
const path = require("path"); // Module to handle file paths
const { v4: uuidv4 } = require("uuid"); // UUID generator to create unique file names

const app = express(); // Initialize Express app
const port = 3000; // Define port number for the server

// Enable CORS and JSON body parsing
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, "../frontend"))); // Serve static files from frontend directory

// API endpoint to compile and execute C++ code
app.post("/run", (req, res) => {
  const { code, input } = req.body; // Extract code and input from request body
  if (!code) {
    return res.status(400).json({ error: "No code provided." }); // Return error if no code is provided
  }

  const uniqueId = uuidv4(); // Generate a unique identifier for file names
  const filePath = path.join(__dirname, `temp_${uniqueId}.cpp`); // Create a temporary C++ file
  const outputPath = path.join(__dirname, `temp_${uniqueId}.out`); // Define output executable file

  try {
    fs.writeFileSync(filePath, code); // Write the received C++ code to a temporary file // Compile the C++ code using g++

    exec(`g++ "${filePath}" -o "${outputPath}"`, (err, stdout, stderr) => {
      if (err) {
        fs.unlinkSync(filePath); // Delete source file on compilation error
        return res.status(400).json({ error: stderr || "Compilation error." }); // Return compilation error message
      } // Run the compiled executable

      const process = spawn(outputPath); // Spawn a child process to execute the compiled program

      if (input) {
        process.stdin.write(input + "\n"); // Send input to the C++ program
        process.stdin.end(); // Close stdin stream after sending input
      }

      let output = ""; // Variable to store standard output
      let errorOutput = ""; // Variable to store error output

      process.stdout.on("data", (data) => {
        output += data.toString(); // Append received data to output
      });

      process.stderr.on("data", (data) => {
        errorOutput += data.toString(); // Append received data to error output
      });

      process.on("close", (code) => {
        fs.unlinkSync(filePath); // Delete source file after execution
        fs.unlinkSync(outputPath); // Delete compiled executable after execution

        if (code !== 0) {
          return res
            .status(400)
            .json({ error: errorOutput || "Runtime error" }); // Return runtime error if exit code is non-zero
        }

        res.json({ output }); // Send the program output as response
      });
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." }); // Handle unexpected server errors
  }
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`); // Log server start message
});
