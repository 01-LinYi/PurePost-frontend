# PurePost Frontend

![React Native](https://img.shields.io/badge/React_Native-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)

![PurePost Logo](./assets/images/purePostTransparent.png)

PurePost is an innovative social media platform designed to empower users to identify potential deepfake images and videos through robust deepfake detection tools. This repository contains the frontend of PurePost, built using **React Native** and **Expo** for iOS and Android.

---

## Backend Repository

Handles user management, content posting, social interactions, and deepfake detection:  
[PurePost Backend Repository](https://github.com/01-LinYi/PurePost-backend)

---

## 🚀 Development Guide

### **Prerequisites**

Ensure you have installed:

- [Git](https://git-scm.com/downloads)
- [Node.js (LTS)](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) (optional)

Check your setup:

```sh
node -v && npm -v && git --version
```

### **Clone the Repository**

```sh
git clone https://github.com/01-LinYi/PurePost-frontend.git
cd PurePost-frontend
```

### **Install Dependencies**

Using npm:

```sh
npm install
```

Or using Yarn:

```sh
yarn install
```

### **Running the Application**

To start the development server, run:

```sh
npm start
```

Or using Yarn:

```sh
yarn start
```

This will start the Expo development server. You can then use the Expo Go app on your mobile device to scan the QR code and run the application.

### **Running on Android**

```sh
npm run android
```

Or using Yarn:

```sh
yarn android
```

### **Running on iOS**

```sh
npm run ios
```

Or using Yarn:

```sh
yarn ios
```

### **Running on Web**

```sh
npm run web
```

Or using Yarn:

```sh
yarn web
```

### **Running Tests**

To run the tests, use:

```sh
npm test
```

Or using Yarn:

```sh
yarn test
```

### **Building the Application**

To build the application for production, use:

```sh
npm run build
```

Or using Yarn:

```sh
yarn build
```

This will create a production build of the application.

### **Environment Variables**

Copy the .env.example file to `.env` and update the values as needed:

```sh
cp .env.example .env
```

### **Contributing**

#### Branching and Workflow

- **The main branch** contains the stable code. Avoid directly pushing breaking changes to main.
- **Create Feature Branches**:

  - Use a descriptive branch name, e.g., feature/add-login, fix/navbar-bug.
  - Branch from main:

  ```bash
  git checkout -b feature/your-branch-name main
  ```

### Continuous Integration (CI)

This project uses GitHub Actions to automate the Continuous Integration (CI) process, ensuring code quality through automated builds and tests. The CI pipeline is configured to run on every push and pull request to the main branch.
