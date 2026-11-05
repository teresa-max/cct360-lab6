const apiURL = "https://date.nager.at/api/v3/NextPublicHolidaysWorldwide";

// Solemn or political days are not a good fit for a playful note, so we leave them out.
const solemnWords = [
  "remembrance",
  "memorial",
  "armistice",
  "veteran",
  "martyr",
  "mourning",
  "genocide",
  "fallen",
  "souls",
  "lāčplēsis",
  "border guard",
  "revolution",
];

// These country names read better with "the" in front of them
const countriesWithThe = [
  "BS",
  "CF",
  "DO",
  "FK",
  "FO",
  "GB",
  "GM",
  "KM",
  "KY",
  "MH",
  "MP",
  "MV",
  "NL",
  "PH",
  "SB",
  "SC",
  "TC",
  "US",
  "VG",
  "VI",
];

const nameInput = document.querySelector("#student-name");
const button = document.querySelector("#excuse-button");
const excuseCount = document.querySelector("#excuse-count");
const note = document.querySelector("#note");
const excuse = document.querySelector("#excuse");
const closer = document.querySelector("#closer");
const holidayDate = document.querySelector("#holiday-date");
const jurisdiction = document.querySelector("#jurisdiction");
const credibilityScore = document.querySelector("#credibility-score");
const credibilityVerdict = document.querySelector("#credibility-verdict");
const credibilityBar = document.querySelector("#credibility-bar");
const stamp = document.querySelector("#stamp");
const stampTop = document.querySelector("#stamp-top");
const stampBottom = document.querySelector("#stamp-bottom");

let holidays = [];
let currentHoliday = null;
let closerNumber = 0;

async function getHolidays() {
  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    console.log(data); // Check the JSON structure in the console

    holidays = data.filter(function (holiday) {
      const name = holiday.name.toLowerCase();
      return !solemnWords.some(function (word) {
        return name.includes(word);
      });
    });

    if (holidays.length === 0) {
      throw new Error("No holidays available");
    }

    button.disabled = false;
    button.textContent = "Find another holiday";
    excuseCount.textContent = `${holidays.length} public holidays in the next 7 days, including ${holidays[0].name}.`;
    makeExcuse();
  } catch (error) {
    console.error("Error:", error);
    excuse.textContent =
      "The holiday list didn't load. Refresh the page to try again.";
    button.textContent = "Holidays unavailable";
  }
}

function makeExcuse() {
  let randomHoliday = holidays[Math.floor(Math.random() * holidays.length)];

  // Avoid showing the same holiday twice in a row
  while (holidays.length > 1 && randomHoliday === currentHoliday) {
    randomHoliday = holidays[Math.floor(Math.random() * holidays.length)];
  }

  currentHoliday = randomHoliday;
  closerNumber = Math.floor(Math.random() * 3);

  showNote();
  showCredibility();
  showStamp();
  restartAnimation(note, "refiled");
}

function getCountryName(code) {
  // Turns a code like "JP" into a full country name like "Japan"
  const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
  const country = countryNames.of(code);

  if (countriesWithThe.includes(code)) {
    return "the " + country;
  }

  return country;
}

function getCloser(country) {
  const closers = [
    `Thank you for your understanding.`,
    `Regular attendance will resume after the holiday.`,
    `Wishing everyone in ${country} a good holiday.`,
  ];

  return closers[closerNumber];
}

function showNote() {
  const student = nameInput.value.trim() || "this student";
  const country = getCountryName(currentHoliday.countryCode);

  excuse.textContent = `Please excuse ${student} from class in recognition of ${currentHoliday.name} in ${country}.`;
  closer.textContent = getCloser(country);
  holidayDate.textContent = currentHoliday.date;
  jurisdiction.textContent = `${country} (${currentHoliday.countryCode})`;
}

function getDaysUntilHoliday() {
  // en-CA formats the local date as YYYY-MM-DD, the same format as the API
  const today = new Date().toLocaleDateString("en-CA");
  const todayTime = new Date(today + "T00:00").getTime();
  const holidayTime = new Date(currentHoliday.date + "T00:00").getTime();
  const days = Math.round((holidayTime - todayTime) / 86400000);

  return Math.max(days, 0);
}

function showCredibility() {
  const days = getDaysUntilHoliday();

  // The sooner the holiday, the higher the score
  const score = Math.max(100 - days * 12, 15);

  credibilityScore.textContent = score;
  credibilityBar.style.width = score + "%";

  if (days === 0) {
    credibilityVerdict.textContent = "Happening today.";
  } else if (days <= 2) {
    credibilityVerdict.textContent = "Coming up very soon.";
  } else if (days <= 5) {
    credibilityVerdict.textContent = "Coming up this week.";
  } else {
    credibilityVerdict.textContent = "Still about a week away.";
  }
}

function showStamp() {
  const days = getDaysUntilHoliday();
  let stampClass;

  if (days === 0) {
    stampClass = "today";
    stampTop.textContent = "APPROVED";
    stampBottom.textContent = "Holiday is today";
  } else {
    stampClass = "upcoming";
    stampTop.textContent = "EARLY";
    stampBottom.textContent = days === 1 ? "1 day ahead" : `${days} days ahead`;
  }

  stamp.className = `stamp ${stampClass}`;
  restartAnimation(stamp, "landing");
}

function restartAnimation(element, animationClass) {
  // Remove the class first so the animation can play again on every click
  element.classList.remove(animationClass);
  void element.offsetWidth;
  element.classList.add(animationClass);
}

button.addEventListener("click", makeExcuse);

// Update the name on the current note while the user types
nameInput.addEventListener("input", function () {
  if (currentHoliday) {
    showNote();
  }
});

getHolidays();
