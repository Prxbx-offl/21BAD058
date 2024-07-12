const express = require('express');
const axios = require('axios');
const app = express();
const config = require('./cong.json');

const PORT = 9876;
const WINDOW_SIZE = 10;

let storedNumbers = [];

// Endpoint to handle requests
app.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;

    try {
        // Fetch numbers based on numberId
        let numbers = await fetchNumbers(numberId);

        // Update storedNumbers array
        updateStoredNumbers(numbers);

        // Calculate average
        let avg = calculateAverage();

        // Prepare response JSON
        let response = {
            windowPrevState: storedNumbers.slice(0, storedNumbers.length - numbers.length),
            windowCurrState: storedNumbers.slice(),
            numbers: numbers,
            avg: avg.toFixed(2)
        };

        // Send response
        res.json(response);
    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to fetch numbers from third-party server
// Function to fetch numbers from third-party server
async function fetchNumbers(numberId) {
    let url;
    switch (numberId) {
        case 'p':
            url = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            url = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            url = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            url = 'http://20.244.56.144/test/random';
            break;
        default:
            throw new Error('Invalid numberId');
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `${config.token_type} ${config.access_token}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000 // Timeout set to 5 seconds (adjust as necessary)
        });

        if (response.status !== 200) {
            throw new Error(`Unexpected response status: ${response.status}`);
        }

        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        throw new Error('Error fetching numbers');
    }
}

// Function to update storedNumbers array
function updateStoredNumbers(newNumbers) {
    // Ensure unique numbers
    newNumbers.forEach(num => {
        if (!storedNumbers.includes(num)) {
            storedNumbers.push(num);
        }
    });

    // Maintain window size
    while (storedNumbers.length > WINDOW_SIZE) {
        storedNumbers.shift(); // Remove oldest numbers
    }
}

// Function to calculate average
function calculateAverage() {
    let sum = storedNumbers.reduce((acc, num) => acc + num, 0);
    return sum / Math.min(storedNumbers.length, WINDOW_SIZE);
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
