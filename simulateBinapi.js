const bins = [
  "535522",
  "452005",
"400000",
"54526"
];

/**
* Sends a batch of BIN requests to the API.
* /**
 * Sends a batch request for an array of BINs.
 * @param {string[]} batch - Array of BINs to send in a single batch.
 */
async function sendBatchRequest(batch) {
  try {
    const responses = await Promise.all(
      batch.map(async (bin) => {
        try {
          const response = await fetch(`http://localhost:3000/v1/bindata`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // Add content-type header
            },
            body: JSON.stringify({ bin: bin }),
          });

          if (!response.ok) {
            throw new Error(`API response error for BIN ${bin}: ${response.statusText}`);
          }

          const data = await response.json(); // Parse the response data as JSON
          console.log(bin, data.data);
          return { bin, success: true, data }; // Return data properly
        } catch (error) {
          console.error(`BIN: ${bin}, Error:`, error.message);
          return { bin, success: false, error: error.message };
        }
      })
    );

    return responses;
  } catch (error) {
    console.error("Error sending batch request:", error);
    throw error;
  }
}

/**
 * Generates a random batch size between min and max.
 * @param {number} min - Minimum batch size.
 * @param {number} max - Maximum batch size.
 * @returns {number} Random batch size.
 */
function getRandomBatchSize(min = 1, max = 1) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Runs the simulation by sending requests in batches with variable sizes continuously.
 */
async function runSimulation() {
  let index = 0;
  const totalBins = bins.length;

  while (index < totalBins) {
    const batchSize = getRandomBatchSize();

    const batch = bins.slice(index, index + batchSize);
    console.log(`Sending batch of ${batch.length} requests: ${batch}`);
    await sendBatchRequest(batch);

    index += batchSize;
  }

  console.log("Simulation completed.");
}

runSimulation().catch((error) => {
  console.error("Simulation error:", error);
});
