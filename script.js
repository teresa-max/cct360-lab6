const apiURL = "https://date.nager.at/api/v3/NextPublicHolidaysWorldwide";

async function getHolidays() {
  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    console.log(data);

    document.querySelector("#excuse").textContent =
      "Today's excuse: " + data[0].name + " in " + data[0].countryCode;
    document.querySelector("#excuse-button").textContent = "Coming soon";
  } catch (error) {
    console.error("Error:", error);
  }
}

getHolidays();
