import axios from "axios";

export async function getCoordinates(address: string, city: string) {
  const apiKey = process.env.GEOCODING_API_KEY; // Use OpenCage or Google Maps API
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    `${address},${city}`
  )}&key=${apiKey}`;

  const response = await axios.get(url);

  const { lat, lng } = response?.data?.results[0]?.geometry;
  return { lat, lng };
}
