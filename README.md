# WalletAnalyser Frontend

**WalletAnalyser** is a modern platform for personal portfolio analysis.  
The project aims to make investing and tracking stocks/ETFs simple, visual, and intuitive, with advanced analysis and comparison tools.

The client frontend provides the full user interface to:

- 📊 Import portfolios from CSV or Excel  
- 🔄 Modify and update positions (stocks, ETFs, cash)  
- 📈 Visualize portfolio evolution with charts and metrics (gain, gain %, TWR, volatility, Sharpe, XIRR…)  
- 🧠 Explore AI recommendations and similar portfolio clusters  
- 🌍 Sort and visualize exposure by country, sector, or sector/country combination  
- 📚 Check historical performance and gains over time  
- ⚖️ Compare the portfolio with market benchmarks  
- 🏆 Earn badges and track important metrics for gamification  

The frontend is built with **React**, **Vite**, **TailwindCSS**, and **DaisyUI**, providing:

- 🏎️ A fast and responsive interface  
- 🧩 Modular components for easy extensibility  
- ⚡ Optimized for small bundles and fast load times  
- 📦 A CI/CD-ready architecture for Azure deployment

---

## 🏗️ Running the project locally

Install dependencies:

```shell
npm install
```

Start the development server:

```shell
npm run dev
```

The app will be available at:

```shell
http://localhost:5173
```

---

## 🧹 Linting & Formatting

ESLint (Flat Config) and Prettier are used to keep the codebase clean and consistent.

Run linting:

```shell
npm run lint
``````

Format the code before pushing:

```shell
npm run format
```

---

## 📦 Docker Support

Build the Docker image:

```shell
docker build -t walletanalyser-frontend .
```

Run the container:

```shell
docker run -p 8080:8080 walletanalyser-frontend
```

The production build is served via **Nginx** inside the container.

---

## ☁️ Azure Deployment (CI/CD)

The GitHub Actions workflow automatically:

1. Checks out the repository  
2. Logs into Azure  
3. Logs into the Azure Container Registry  
4. Builds the Docker image  
5. Pushes it to the registry  
6. Restarts the Azure App Service  

Terraform configuration ensures the App Service always pulls the latest image.

---

## 📄 Available Commands

`npm install`  
`npm run dev`  
`npm run build`  
`npm run preview`  
`npm run lint`  
`npm run format`
