# Stock-Portfolio-Tracker
A web application for tracking stock prices and visualizing historical data. Users can add stock tickers to their portfolio, view real-time price updates, and view historical price trends through charts. The application also fetches and displays recent news articles related to selected stocks.

## Features

- Add and remove stock tickers from the portfolio.
- View real-time stock price updates.
- Interactive charts displaying historical price trends (1 Month, 1 Year).
- Fetch and display recent news articles related to selected stocks.
- Responsive design with a modern UI.

## Installation

### Clone the Repository

```bash
git clone https://github.com/CarlOkai/stock-portfolio-tracker.git
cd stock-portfolio-tracker
```

### Set Up the Virtual Environment

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Create a .env File

1. **Get a NewsAPI Key:**
   - Go to the [NewsAPI website](https://newsapi.org/).
   - Click on the **"Get API Key"** or **"Sign Up"** button.
   - Create an account by providing your email address and setting a password. 
   - Once you’re signed up and logged in, navigate to the **"Dashboard"** or **"API Keys"** section of your NewsAPI account.
   - Copy the API key provided. This key is required to access the NewsAPI service.

2. **Add Your API Key to the .env File:**
   - In the root directory of your project, create a file named `.env` if it doesn’t already exist.
   - Open the `.env` file with a text editor and add the following line, replacing `your-news-api-key` with the actual API key you copied:

```env
NEWS_API_KEY=your-news-api-key
```
- Save the `.env` file. This file will store your API key securely.

3. **Use the API Key in Your Application:**
   - Ensure your application is set up to read the `.env` file. The `python-dotenv` package can be used to load environment variables from the `.env` file.

This process ensures that the NewsAPI key is kept secure and not hardcoded into the application’s source code.

### Run the Application

```bash
python app.py
```

The application will be available at [http://127.0.0.1:5000/](http://127.0.0.1:5000/).

## Usage

1. Open the application in your web browser.
2. Use the search box to add stock tickers to your portfolio.
3. Click on a stock box to view real-time prices, historical data, and news articles.
4. Use the chart controls to switch between different time periods (1 Month, 1 Year).



## Acknowledgements

- [yfinance](https://pypi.org/project/yfinance/) for stock data retrieval.
- [NewsAPI](https://newsapi.org/) for fetching news articles.
- [Chart.js](https://www.chartjs.org/) for creating interactive charts.
