const bins = [
  "416598",
  "533317",
  "539132",
  "497711",
  "528689",
  "531483",
  "559272",
  "416598",
  "535522",
  "452005",
  "416538",
  "497040",
  "535574",
  "512458",
  "497874",
  "439556",
  "406577",
  "465858",
  "553771",
  "497355",
  "521729",
  "489022",
  "526430",
  "478554",
  "453304",
  "535522",
  "446291",
  "416598",
  "462239",
  "539160",
  "429941",
  "499001",
  "409748",
  "434994",
  "539890",
  "416598",
  "415299",
  "533317",
  "492181",
  "463342",
  "416538",
  "439771",
  "535142",
  "525855",
  "453304",
  "462239",
  "535522",
  "483741",
  "497783",
  "456432",
  "425893",
  "446291",
  "431947",
  "415019",
  "535463",
  "497941",
  "529192",
  "535596",
  "529097",
  "463343",
  "433367",
  "517608",
  "432265",
  "497355",
  "409201",
  "433367",
  "414767",
  "535456",
  "497355",
  "481000",
  "416549",
  "454617",
  "528733",
  "400536",
  "429941",
  "544612",
  "497355",
  "465865",
  "512111",
  "521729",
  "416598",
  "539939",
  "497043",
  "456933",
  "416598",
  "406577",
  "524197",
  "453359",
  "548742",
  "450060",
  "497040",
  "529097",
  "514834",
  "434975",
  "513283",
  "533305",
  "456933",
  "511768",
  "472409",
  "459448"
];

/**
* Sends a batch of BIN requests to the API.
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
                      body: JSON.stringify({ "bin": bin })
                  });

                  if (!response.ok) {
                      throw new Error(`API response error for BIN ${bin}: ${response.statusText}`);
                  }

                  const data = await response.json(); // Parse the response data as JSON
                  console.log(`BIN: ${bin}, Response:`, data.data);
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
* Generates a random interval between min and max (in minutes) and converts it to milliseconds.
* @param {number} min - Minimum interval in minutes.
* @param {number} max - Maximum interval in minutes.
* @returns {number} Random interval in milliseconds.
*/
function getRandomInterval(min = 1, max = 10) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 60 * 1000; // Convert minutes to milliseconds
}

/**
* Generates a random batch size between min and max.
* @param {number} min - Minimum batch size.
* @param {number} max - Maximum batch size.
* @returns {number} Random batch size.
*/
function getRandomBatchSize(min = 1, max = 15) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
* Runs the simulation by sending requests in batches with variable intervals.
*/
async function runSimulation() {
  let index = 0;
  const totalBins = bins.length;

  while (index < totalBins) {
      const batchSize = getRandomBatchSize();
      const interval = getRandomInterval();

      const batch = bins.slice(index, index + batchSize);
      console.log(`Sending batch of ${batch.length} requests: ${batch}`);
      await sendBatchRequest(batch);

      index += batchSize;

      if (index < totalBins) {
          console.log(`Waiting for ${interval / 60000} minutes before next batch...`);
          await new Promise((resolve) => setTimeout(resolve, interval));
      }
  }

  console.log("Simulation completed.");
}

runSimulation().catch((error) => {
  console.error("Simulation error:", error);
});
