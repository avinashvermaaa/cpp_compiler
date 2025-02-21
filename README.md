# cpp_compiler

# C++ Code Compiler API

## Overview
This project provides a simple API to compile and execute C++ code. It uses **Node.js with Express.js** to handle HTTP requests and executes C++ programs using `g++`. The frontend (HTML, CSS, JavaScript) is served from the `frontend` folder.

## Features
- Accepts C++ code via an API request
- Compiles the code using `g++`
- Executes the compiled binary and returns output
- Handles errors gracefully (compilation & runtime errors)
- Uses **UUID-based file naming** to prevent conflicts
- Implements a **timeout** to prevent infinite loops

## Installation
### Prerequisites
- Node.js (v16 or higher recommended)
- g++ (GCC Compiler)

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo-name.git
   cd your-repo-name
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   node server.js
   ```
4. The server will run on:
   ```
   http://localhost:3000
   ```

## API Usage
### Endpoint: `/run`
**Method:** `POST`

**Request Body:**
```json
{
  "code": "#include<iostream>\nusing namespace std;\nint main() { cout << 'Hello, World!'; return 0; }"
}
```

**Response (Success):**
```json
{
  "output": "Hello, World!"
}
```

**Response (Compilation Error):**
```json
{
  "error": "some compilation error message"
}
```

**Response (Runtime Error):**
```json
{
  "error": "some runtime error message"
}
```

## Security Considerations
- The server uses **UUID-based temp file names** to avoid overwriting files.
- Execution is **limited to 5 seconds** to prevent infinite loops.
- **User input is not sanitized**, so do not expose this API publicly without sandboxing.

## Deployment
### Deploy Frontend:
- Use **Netlify** or **Vercel** to host static files (`frontend` folder).

### Deploy Backend:
- Use **Render** or **Railway** to host the Node.js server.

## Future Enhancements
- Add support for **other programming languages**.
- Implement a **Dockerized** version for isolated execution.
- Improve security with **containerized execution (e.g., Docker + Firecracker VMs).**

## Author
**Avinash Kumar** - Full Stack Developer

