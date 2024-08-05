// Retrieve tickers from localStorage or initialize as an empty array if none exist
var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
var lastPrices = {}; // Object to store the ;ast recorded prices for comparison
var counter = 15; // Countdown timer in seconds
var currentChart = null; // Variable to hold the current chart instance


// Function to start the update cycle for stock prices
function startUpdateCycle() {
    updatePrices(); //Initial price update
    setInterval(function () {
        counter--; // Decrease counter by 1 every second
        $('#counter').text(counter); // Update the counter display
        if (counter <= 0) {
            updatePrices(); // Update prices when counter reaches 0
            counter = 15; // Reset counter
        }
    }, 1000); // Run every 1000 milliseconds (1 second)
}

$(document).ready(function () {
    // Add each ticker to the grid when the document is ready
    tickers.forEach(function (ticker) {
        addTickerToGrid(ticker);
    });

    updatePrices(); // Update prices initially

    $('#add-ticker-form').submit(function (e) {
        e.preventDefault(); // prevent the default form submission
        var newTicker = $('#new-ticker').val().toUpperCase(); // Get and uppercase the new ticker symbol
        if (!tickers.includes(newTicker)) { // Check if the ticker is not already in the list
            tickers.push(newTicker); // Add new ticker to the list
            localStorage.setItem('tickers', JSON.stringify(tickers)); // Save tickers to localStorage
            addTickerToGrid(newTicker);// Add ticker to the grid
        }

        $('#new-ticker').val(''); //  Clear the input field 
        updatePrices(); // Update prices with the new ticker
    });

    // Handle clicks on chart control buttons to change the chart period
    $('#chart-controls').on('click', '.chart-btn', function () {
        var period = $(this).data('period'); // Get the period from the button's data attribute
        var ticker = $('#ticker-grid .stock-box.active').attr('id'); // Get the active stock box's ticker
        fetchHistoricalData(ticker, period);// Fetch historical data for the selected period
    });
    // Handle clicks on the remove button to remove tickers from the grid
    $('#ticker-grid').on('click', '.remove-btn', function (e) {
        e.stopPropagation(); // Stop event propagation to prevent triggering the chart modal
        var tickerToRemove = $(this).data('ticker');// Get the ticker to remove
        tickers = tickers.filter(t => t !== tickerToRemove);// Remove the ticker from the lsist
        localStorage.setItem('tickers', JSON.stringify(tickers));//Update local storage
        $(`#${tickerToRemove}`).remove();
    });

    // Handle clicks on stock boxes to display the chart and fetch data
    $('#ticker-grid').on('click', '.stock-box', function () {
        var ticker = $(this).attr('id'); //Get the ticker of the clicked stock box
        $('.stock-box').removeClass('active'); // Remove active class from all stock boxes
        $(this).addClass('active'); // Add active class to the clicked stock box
        fetchHistoricalData(ticker, '1y'); // Default to 1 year data
        fetchNews(ticker);  // Fetch news articles for the ticker
        $('#chart-modal').show(); // Display chart
    });

    // Handle clicks on the close button to hide the chart modal
    $('.close').click(function () {
        $('#chart-modal').hide();
    });

    // Handle clicks outside the chart modal to hide it
    $(window).click(function (event) {
        if ($(event.target).is('#chart-modal')) {
            $('#chart-modal').hide();
        }
    });

    startUpdateCycle(); // Start the update cycle for stock prices
});


// Function to add a ticker to the grid
function addTickerToGrid(ticker) {
    $('#ticker-grid').append(`
        <div id="${ticker}" class="stock-box">
            <h2>${ticker}</h2>
            <p id="${ticker}-price"></p>
            <p id="${ticker}-pct"></p>
            <button class="remove-btn" data-ticker="${ticker}">Remove</button>
        </div>
    `);
}

// Function to fetch historical data function with period parameter
function fetchHistoricalData(ticker, period) {
    $.ajax({
        url: '/get_historical_data',
        type: 'POST',
        data: JSON.stringify({ 'ticker': ticker, 'period': period }), // Send ticker and period in the request
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (historicalData) {
            var labels = historicalData.dates; // Dates for x axis
            var prices = historicalData.prices;// Prices for y axis

            if (currentChart) {
                currentChart.destroy(); // Destroy the existing chart if it exists
            }

            var ctx = $('#stock-chart')[0].getContext('2d');
            currentChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Price',
                        data: prices,
                        borderColor: 'rgba(54, 162, 235, 1)', // Blue color for the line
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 1,
                        pointRadius: 0 // No points on the line
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { beginAtZero: false }, // Do not begin the x-axis at zero
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function (value) { return '$' + value.toFixed(2); } // Format y-axis labels as currency
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }, // Hide the legend
                        tooltip: {
                            callbacks: {
                                label: function (context) { return 'Price: $' + context.parsed.y.toFixed(2); } // Format tooltip labels
                            }
                        }
                    }
                }
            });
        },
        error: function (xhr, status, error) {
            console.error('Error fetching historical data:', status, error);
        }
    });
}


// Function to update stock prices for all tickers
function updatePrices() {
    tickers.forEach(function (ticker) {
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({ 'ticker': ticker }), // Send ticker in the request
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                var colorClass;
                // Determine the color class based on the price change percentage
                if (changePercent <= -2) {
                    colorClass = 'dark-red';
                } else if (changePercent < 0) {
                    colorClass = 'red';
                } else if (changePercent === 0) {
                    colorClass = 'gray';
                } else if (changePercent <= 2) {
                    colorClass = 'green';
                } else {
                    colorClass = 'dark-green';
                }

                // Update the price and percentage text and apply the appropriate color class
                $(`#${ticker}-price`).text(`$${data.currentPrice.toFixed(2)}`);
                $(`#${ticker}-pct`).text(`${changePercent.toFixed(2)}%`);
                $(`#${ticker}-price`).removeClass('dark-red red gray green dark-green').addClass(colorClass);
                $(`#${ticker}-pct`).removeClass('dark-red red gray green dark-green').addClass(colorClass);

                var flashClass;
                // Determine the flash class based on price movement
                if (lastPrices[ticker] > data.currentPrice) {
                    flashClass = 'red-flash';
                } else if (lastPrices[ticker] < data.currentPrice) {
                    flashClass = 'green-flash';
                } else {
                    flashClass = 'gray-flash';
                }
                lastPrices[ticker] = data.currentPrice; // Update the last price
                $(`#${ticker}`).addClass(flashClass); // Apply the flash class to the ticker element
                setTimeout(function () {
                    $(`#${ticker}`).removeClass(flashClass); // Remove the flash class after 1 second
                }, 1000);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching stock data:', status, error);
            }
        });
    });
}
// Function to fetch news articles for a given ticker and update the news modal
function fetchNews(ticker) {
    $.ajax({
        url: '/get_news',
        type: 'POST',
        data: JSON.stringify({ 'ticker': ticker, 'language': 'en' }), // Send ticker and language in the request
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (newsData) {
            var articles = newsData.articles;
            var newsHtml = '';

            // Only include the first 5 articles
            articles.slice(0, 5).forEach(function (article) {
                newsHtml += `
                    <div class="news-article">
                        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                        <p>${article.description}</p>
                    </div>
                `;
            });

            // If no relevant news is found, display a message
            if (articles.length === 0) {
                newsHtml = `<p>No news articles found for ${ticker}.</p>`;
            }

            $('#news-content').html(newsHtml);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching news:', status, error);
        }
    });
}


// Handle click event to open the chart modal and fetch news
$('#ticker-grid').on('click', '.stock-box', function () {
    var ticker = $(this).attr('id');
    fetchHistoricalData(ticker);
    fetchNews(ticker);
    $('#chart-modal').show();
});

