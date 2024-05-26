document.addEventListener("DOMContentLoaded", () => {
  const geoapifyAPIKey = "37459595705b42219a482676c154e260"; // Replace with your Geoapify API key

  // Function to display the timezone information
  function displayTimeZone(data, prefix = "") {
    document.getElementById(`${prefix}timezone-name`).innerText =
      data.timezone.name;
    document.getElementById(`${prefix}lat`).innerText = data.location.lat;
    document.getElementById(`${prefix}long`).innerText = data.location.lon;
    document.getElementById(`${prefix}offset-std`).innerText =
      data.timezone.offset_STD;
    document.getElementById(`${prefix}offset-std-seconds`).innerText =
      data.timezone.offset_STD_seconds;
    document.getElementById(`${prefix}offset-dst`).innerText =
      data.timezone.offset_DST;
    document.getElementById(`${prefix}offset-dst-seconds`).innerText =
      data.timezone.offset_DST_seconds;
    document.getElementById(`${prefix}country`).innerText = data.country;
    document.getElementById(`${prefix}postcode`).innerText =
      data.postcode || "N/A";
    document.getElementById(`${prefix}city`).innerText = data.city || "N/A";
  }

  // Get the user's current location using the Geolocation API
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${geoapifyAPIKey}`
        )
          .then((response) => response.json())
          .then((data) => {
            const result = data.features[0].properties;
            displayTimeZone({
              location: { lat, lon },
              timezone: result.timezone,
              country: result.country,
              postcode: result.postcode,
              city: result.city,
            });
          })
          .catch((error) => {
            console.error("Error fetching timezone data:", error);
            alert("An error occurred while fetching the timezone data.");
          });
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("An error occurred while getting your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }

  // Form submission to get timezone information for an entered address
  const form = document.getElementById("address-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const address = document.getElementById("address").value;

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          address
        )}&apiKey=${geoapifyAPIKey}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const location = data.features[0].geometry.coordinates;
        const lat = location[1];
        const lon = location[0];
        const timezoneResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${geoapifyAPIKey}`
        );
        const timezoneData = await timezoneResponse.json();
        const result = timezoneData.features[0].properties;
        displayTimeZone(
          {
            location: { lat, lon },
            timezone: result.timezone,
            country: result.country,
            postcode: result.postcode,
            city: result.city,
          },
          "address-"
        );
      } else {
        alert("No results found for the given address.");
      }
    } catch (error) {
      console.error("Error fetching geocode data:", error);
      alert("An error occurred while fetching the geocode data.");
    }
  });
});
