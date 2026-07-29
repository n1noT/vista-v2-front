# 🏆 VISTA - Frontend

*A modern, interactive platform for football tournament brackets and predictions.*

## 📖 About VISTA

VISTA is built for football enthusiasts who love the thrill of the game and the satisfaction of a perfect prediction. It is a comprehensive web application where users can test their football knowledge by predicting league standings, bracket outcomes, and match results.

The platform offers an engaging, seamless experience—allowing users to intuitively drag and drop teams to form the perfect league table, track their success, and climb the global leaderboards. 

Behind the scenes, VISTA includes a powerful administrative hub. This allows for total control over the platform's data, including managing seasons, synchronizing live odds, orchestrating leagues, and overseeing player predictions. 

This repository contains the **Angular** frontend client, designed to integrate smoothly with the project's NestJS and PostgreSQL backend architecture.

## ✨ Key Features

- **Interactive Predictions:** An intuitive drag-and-drop interface for building championship tables and bracket predictions.
- **Dynamic Leaderboards:** Global and league-specific rankings to spark competition among players.
- **User Profiles:** Personalized public and private hubs to track prediction history and performance stats.
- **Comprehensive Admin Dashboard:** A dedicated space for administrators to manage seasons, teams, leagues, odds, and synchronize external data.
- **Authentication:** Secure login and registration flows for all players.

## 🛠 Tech Stack

- **Framework:** Angular
- **Styling:** PostCSS / Tailwind CSS
- **Testing:** Playwright (E2E)
- **Containerization:** Docker

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Development Server

Run the following command to start the development server:
```bash
npm start
```
Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build for Production

To build the project for production, run:
```bash
npm run build
```
The optimized build artifacts will be stored in the `dist/` directory, ready for deployment.

### Running E2E Tests

VISTA uses Playwright for robust end-to-end testing:
```bash
npx playwright test
```

## 🐳 Docker Deployment

VISTA is fully containerized for easy deployment. Ensure your Docker daemon is running, then execute:

```bash
# Build the image
docker build -t vista-front .

# Run the container (using explicit bind mount if needed for local dev, or standard port mapping for production testing)
docker run -p 4200:4200 vista-front
```
