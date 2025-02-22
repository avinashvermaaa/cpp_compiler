const BACKEND_URL = "https://cpp-compiler-qrgp.onrender.com";
// JavaScript for handling code execution and other features

// Global variable to store the filename
let fileName = "code.cpp";

// Event listener for the "Run Code" button (compiling and running C++ code)
document.getElementById("runButton").addEventListener("click", async () => {
  const code = document.getElementById("cppCode").value;
  const stdinInput = document.getElementById("stdinInput").value;
  const outputElement = document.getElementById("output");

  // Clear previous output but maintain output box size
  outputElement.textContent = "";
  outputElement.style.maxHeight = "200px"; // Reset to default height

  // If the user has not entered any code
  if (code.trim() === "") {
    outputElement.textContent = "Please enter some C++ code!";
    return;
  }

  try {
    // Send code and input to the server for compilation and execution
    const response = await fetch(`${BACKEND_URL}/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code, input: stdinInput }),
    });

    // Check if the server responded with an error
    if (!response.ok) {
      const errorData = await response.json();
      outputElement.textContent =
        errorData.error || "An unknown error occurred during compilation.";
      outputElement.style.overflowY = "auto"; // Allow scrolling for long errors
      return;
    }

    // Parse the server's response
    const data = await response.json();

    // Display the compiled output
    outputElement.textContent = data.output || "No output from program.";
  } catch (error) {
    // In case the fetch request fails (e.g., network error)
    console.error("Fetch error:", error);
    outputElement.textContent =
      "An error occurred while communicating with the server.\n" +
      "Try running the server first or please try again later.";
    outputElement.style.overflowY = "auto"; // Ensure errors don't stretch the box
  }
});

// Event listener for the "Download Code" button to download the C++ code as a .cpp file
document
  .getElementById("downloadButton")
  .addEventListener("click", function () {
    const cppCode = document.getElementById("cppCode").value;

    if (!cppCode) {
      alert("Please enter some C++ code before downloading!");
      return;
    }

    const blob = new Blob([cppCode], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName; // Use the global variable for the file name
    link.click();
  });

// Event listener for the "Rename" button to rename the file
document.getElementById("renameButton").addEventListener("click", function () {
  const newName = prompt(
    "Enter a new name for your file (without extension):",
    "code"
  );
  if (newName && newName.trim() !== "") {
    fileName = `${newName.trim()}.cpp`; // Update the global file name variable
  }
});

// Dark mode toggle functionality
document
  .getElementById("darkModeButton")
  .addEventListener("click", function () {
    const darkModeButton = document.getElementById("darkModeButton");
    document.body.classList.toggle("dark-mode");
    document.querySelector(".container").classList.toggle("dark-mode");
    const buttons = document.querySelectorAll(".top-bar button");
    buttons.forEach((button) => {
      button.classList.toggle("dark-mode"); // Apply dark mode style to buttons
    });

    // Switch between sun/moon icons based on the mode
    darkModeButton.textContent = document.body.classList.contains("dark-mode")
      ? "🌞"
      : "🌙";
  });
