# yfinance - a Python library that allows you to access financial data from Yahoo Finance
# We use this to fetch stock data including historical prices and current stock information

import yfinance as yf
from flask import Flask, request, jsonify, render_template
import requests
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialise Flask application
app = Flask(__name__, template_folder='templates')

#Route for the home page
@app.route('/')
def index():
    # Render the main HTML template
    return render_template('index.html')

# Route to get stock data (current and opening prices)
@app.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    try:
        # Extract the ticker symbol from the JSON data sent in the POST request
        ticker = request.get_json()['ticker']
        
        # Fetch the historical stock data for the past year using the ticker symbol
        stock = yf.Ticker(ticker)
        data = stock.history(period='1y')
        
        if data.empty:
            #Return error if no data is found for the given ticker symbol
            return jsonify({'error': 'No data found for the given ticker symbol'}), 404

        # Return the current and opening prices of the latest data as a JSON response
        latest_data = data.iloc[-1] # Get the most recent row of data
        return jsonify({
            'currentPrice': latest_data['Close'],
            'openPrice': latest_data['Open']
        })
        
    except KeyError:
        # Handle case where ticker symbol is not provided in the request
        return jsonify({'error': 'Ticker symbol not provided'}), 400
    except Exception as e:
        # Hanfle any other errors
        return jsonify({'error': str(e)}), 500


# Route to get historical stock data for a specified period
@app.route('/get_historical_data', methods=['POST'])
def get_historical_data():
    try:
        data = request.get_json()
        ticker = data['ticker']
        period = data.get('period', '1y')  # Default to 1 year if no period is provided
        
        # Fetch historical data using the ticker symbol and specified period
        stock = yf.Ticker(ticker)
        data = stock.history(period=period)

        if data.empty:
            # Return error if no data is found for the given ticker symbol
            return jsonify({'error': 'No data found for the given ticker symbol'}), 404
        
        # Prepare historical data for response
        historical_data = {
            'dates': data.index.strftime('%Y-%m-%d').tolist(),
            'prices': data['Close'].tolist()
        }
        #Return the historical data as JSON
        return jsonify(historical_data)
        
    except KeyError:
        # Handle case where ticker symbol is not provided in the request
        return jsonify({'error': 'Ticker symbol not provided'}), 400
    except Exception as e:
        # Handle any other errors
        return jsonify({'error': str(e)}), 500


# Route to get news articles related to a ticker symbol
@app.route('/get_news', methods=['POST'])
def get_news():
    # Parse the JSON data from the request
    data = request.json
    ticker = data['ticker']
    news_api_key = os.getenv('NEWS_API_KEY')  # Load the API key from environment variable
    language = data.get('language', 'en')  # Get the language parameter, default to 'en'
    # Construct the URL to fetch news articles for the ticker
    news_url = f'https://newsapi.org/v2/everything?q={ticker} stock&language={language}&apiKey={news_api_key}'
    
    # Send a GET request to the NewsAPI
    response = requests.get(news_url)
    news_data = response.json() # Parse the JSON response
    
    # Return the news data as JSON
    return jsonify(news_data)

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)
