import { fetchWeatherDataWithFallback } from "../meteorological-sync-engine";

async function testLiveWeather() {
  console.log("=== LIVE WEATHER TEST START ===");
  
  // You can change the city here
  const city = "Las Vegas";
  
  console.log(`Fetching weather for: ${city}`);
  
  const weather = await fetchWeatherDataWithFallback(city, (msg: string) => {
    // Pipe the internal engine logs straight to console
    console.log(msg);
  });
  
  console.log("\n=== FINAL PARSED WEATHER PAYLOAD ===");
  console.log(JSON.stringify(weather, null, 2));
  console.log("====================================");
}

testLiveWeather().catch(console.error);
