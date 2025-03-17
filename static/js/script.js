// static/js/script.js
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const predictionForm = document.getElementById('prediction-form');
    const sepalLengthInput = document.getElementById('sepal-length');
    const sepalWidthInput = document.getElementById('sepal-width');
    const petalLengthInput = document.getElementById('petal-length');
    const petalWidthInput = document.getElementById('petal-width');
    const predictionResultDiv = document.getElementById('prediction-result');
    const exampleButtons = document.querySelectorAll('.use-example-btn');
    
    // Initialize Chart.js
    const ctx = document.getElementById('probability-chart').getContext('2d');
    let probabilityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Setosa', 'Versicolor', 'Virginica'],
            datasets: [{
                label: 'Probability',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(255, 154, 162, 0.7)',
                    'rgba(181, 234, 215, 0.7)',
                    'rgba(199, 206, 234, 0.7)'
                ],
                borderColor: [
                    'rgb(255, 154, 162)',
                    'rgb(181, 234, 215)',
                    'rgb(199, 206, 234)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Probability'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Class Probabilities'
                }
            }
        }
    });

    // Handle form submission
    predictionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get input values
        const features = [
            parseFloat(sepalLengthInput.value),
            parseFloat(sepalWidthInput.value),
            parseFloat(petalLengthInput.value),
            parseFloat(petalWidthInput.value)
        ];
        
        // Make prediction request
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ features: features }),
        })
        .then(response => response.json())
        .then(data => {
            // Display result
            displayPredictionResult(data, features);
            // Update chart
            updateProbabilityChart(data.probabilities);
        })
        .catch(error => {
            predictionResultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        });
    });

    // Handle example buttons
    exampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const features = JSON.parse(this.parentElement.dataset.features);
            
            // Fill form with example values
            sepalLengthInput.value = features[0];
            sepalWidthInput.value = features[1];
            petalLengthInput.value = features[2];
            petalWidthInput.value = features[3];
            
            // Submit form
            predictionForm.dispatchEvent(new Event('submit'));
        });
    });

    // Function to display prediction result
    function displayPredictionResult(data, features) {
        const result = `
            <h3>Prediction: <span class="prediction-class">${data.class_name}</span></h3>
            <p>Based on the following measurements:</p>
            <ul>
                <li>Sepal Length: ${features[0]} cm</li>
                <li>Sepal Width: ${features[1]} cm</li>
                <li>Petal Length: ${features[2]} cm</li>
                <li>Petal Width: ${features[3]} cm</li>
            </ul>
            <p>Confidence: ${(data.probabilities[data.class_name] * 100).toFixed(2)}%</p>
        `;
        
        predictionResultDiv.innerHTML = result;
    }

    // Function to update probability chart
    function updateProbabilityChart(probabilities) {
        const data = [
            probabilities.setosa || 0,
            probabilities.versicolor || 0,
            probabilities.virginica || 0
        ];
        
        probabilityChart.data.datasets[0].data = data;
        probabilityChart.update();
    }
});