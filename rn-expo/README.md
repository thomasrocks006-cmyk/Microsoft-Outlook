# rn-expo

## Overview
rn-expo is a React Native application that utilizes Expo for rapid development and deployment. This project is set up with TypeScript for type safety and improved developer experience.

## Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- npm (Node package manager)
- Expo CLI

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/rn-expo.git
   cd rn-expo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Enable Corepack and install `eas-cli`:
   ```
   corepack enable
   npm install -g eas-cli
   ```

### Running the Application
To start the development server, run:
```
npm start
```
This will open the Expo developer tools in your browser.

### Forwarded Ports
The following ports are forwarded for your convenience:
- 19000: Expo Go
- 19001: Debugging
- 19006: Webpack
- 8081: React Native packager

### Building the Application
To build the application for production, use:
```
eas build
```

### Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

### License
This project is licensed under the MIT License. See the LICENSE file for details.