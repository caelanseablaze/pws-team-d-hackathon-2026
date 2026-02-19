// -----DEFINING A WHOLE LOTTA VARIABLES----- //
	let isRatingMode = false; // tells us whether we are currently rating a thing

	// app screens
	const SCREENS = {
		HOME_SCREEN: document.getElementById("homeScreen"),
		GAME_SCREEN: document.getElementById("gameScreen"),
		CREATURE_SCREEN: document.getElementById("creatureScreen"),
		INFO_SCREEN: document.getElementById("infoScreen"),
		OPTION_SCREEN: document.getElementById("optionScreen"),
	}
	var active = null;

	const NAV_ITEMS = document.querySelectorAll("nav ul li");

	const LOCATION_NAME_DISPLAY = document.getElementById("locationName"); // location name display
	const LOCATION_RATINGS_DISPLAY = document.getElementById("locationRatings"); // location averages box display

	// within LOCATION_RATINGS_DISPLAY, the individual rating averages
	const rampsRating_display = document.getElementById("ramps");
	const walkwaysRating_display = document.getElementById("walkways");
	const doorsRating_display = document.getElementById("doors");
	const signageRating_display = document.getElementById("signage");

	const RATING_CONTAINER = document.getElementById("rating_container"); // for rating a location
	const START_BUTTON = document.getElementById("rateButton"); // button that prompts you to rate a location
	const PROMPT = document.getElementById("ratingPrompt"); // just says something like "rate PAREF Woodrose school" or smth


	var targetedLocation = ""; // this will change often

	// for creatures
	const RANDOM_NAME_LIST = [
		"Bloop","Globby","Wibble","Momo","Puffin","Niblet","Squoosh","Puddle","Jellybean","Boop",
    "Snibble","Tofu","Marsh","Plip","Bubbles","Doodle","Sprout","Mallow","Pip","Squishlet",
    "Flump","Gumbo","Wobble","Peep","Mush","Zuzu","Panko","Blub","Fizzle","Lulu",
    "Glimmer","Syrup","Taffy","Noodle","Pogo","Skippy","Nib","Bibble","Splatty","Mimi",
    "Wiggle","Puff","Goober","Binky","Churro","Froth","Mocha","Sprinkle","Zippy","Kiki",

    "Zorb","Plonk","Gribble","Snorf","Blazz","Wunk","Frizzle","Zabble","Glonk","Bramf",
    "Sloop","Wazzle","Dorb","Flarn","Skloop","Womp","Yibble","Zoot","Kribble","Floon",
    "Drabble","Skrim","Bozzle","Zim","Flibble","Grunk","Plib","Zorp","Snazz","Morb",
    "Tromp","Wib","Flumpkin","Glorp","Zibble","Yorp","Snoot","Framp","Skibble","Wubble",
    "Blim","Zapple","Grizzle","Plim","Snib","Frop","Zarn","Womble","Grum","Sploot"
	]
	const ELEMENT_LIST = [
		"fire", "water", "earth", "wind"
	]
	const STYLE_LIST = [
		"solid", "translucent", "metallic", "glowing", "sparkly"
	]
	const EXPRESSIONS_LIST = [
		"happy", "whimsical", "angry", "sleepy", "sad"
	]

	const CREATURES_DISPLAY = document.getElementById("creatureDisplay");
	const CREATURES_NAVIGATION = document.getElementById("creatureNavigation");

// ----- MISCELLANEOUS FUNCTIONS ----- //
function randomInteger(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

// ----- USER IDENTIFICATION ----- //
// it still resets all user-submitted ratings upon refresh so this exists just to show  you can't spam ratings
let userID = localStorage.getItem("userID");
document.getElementById("UUID_display").innerHTML = userID

if (!userID) {
  userID = crypto.randomUUID();
  localStorage.setItem("userID", userID);
}

// -----GAME SCREEN SWITCHING----- //
function openScreen(screenName) {
	screenKeys = Object.keys(SCREENS); // gets a list of all screen names from SCREEN dictionary:
	for (num = 0; num < screenKeys.length; num ++) { // loops through all screen names
		if (screenKeys[num] === screenName) { // if the current screen key matches the one you're trying to show:
			SCREENS[screenName].classList.remove("hidden"); //remove "hidden" class from target screen
		} else {
			SCREENS[screenKeys[num]].classList.add("hidden"); //add "hidden" class to non-screen key
		}
	}
	// set the next active navigation bar item
	for (navItemIndex = 0; navItemIndex < NAV_ITEMS.length; navItemIndex ++) {
		if (NAV_ITEMS[navItemIndex].classList.contains(screenName)) {
			NAV_ITEMS[navItemIndex].classList.add("active");
		} else {
			NAV_ITEMS[navItemIndex].classList.remove("active");
		}
	}
}
// runs at start
openScreen("GAME_SCREEN");

// -----CREATURES----- //
// function to create a random creature
function Creature() {
	this.name = RANDOM_NAME_LIST[randomInteger(0, RANDOM_NAME_LIST.length)];
	this.species = "blob";
	this.element = ELEMENT_LIST[randomInteger(0, ELEMENT_LIST.length)];
	this.color = randomInteger(1,3)
	this.style = STYLE_LIST[randomInteger(0, STYLE_LIST.length)];
	this.expression = EXPRESSIONS_LIST[randomInteger(0, EXPRESSIONS_LIST.length)];
	console.log(`Created new ${this.style} ${this.species} "${this.name}" with element ${this.element} and color ${this.color}. It's feeling ${this.expression}!`); //testing
}

// -----USER INVENTORY AND CREATURES ----- //
myCreatures = [new Creature(), new Creature()];

// -----FUNCTION FOR LOADING CREATURES ON CREATURE SCREEN----- //
function loadCreatures() {
	// reset 
	CREATURES_DISPLAY.innerHTML = "";
	CREATURES_NAVIGATION.innerHTML = "";

	for (let i = 0; i < myCreatures.length; i++) {
		creature = myCreatures[i]
		// add navigation icon thing
		const icon = document.createElement("div");
		icon.classList.add("creature-icon");
		icon.innerHTML = `${creature.name}`;
		CREATURES_NAVIGATION.appendChild(icon);

		// add details card
		const card = document.createElement("div");
    card.classList.add("creature-card");
    card.innerHTML = `
	    <h3>${creature.name}</h3>
	    <p>Species: ${creature.species}</p>
	    <p>Element: ${creature.element}</p>
	    <p>Style: ${creature.style}</p>
    `;
    CREATURES_DISPLAY.appendChild(card);
	}
	// select the first creature
}

// -----MAP SETUP----- //
// Set up map
var map = L.map('map', {
    minZoom: 10, // can't zoom out past neighborhood view
    maxZoom: 18  // can't zoom in past street level
}).setView([14.399444, 121.012500], 18);

// Defines some map functions and a mode variable that can be used later
function freezeMap() {
  map.dragging.disable();
  map.scrollWheelZoom.disable();
  map.doubleClickZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.touchZoom.disable();

  if (map.tap) map.tap.disable(); //for mobile users
}
function unfreezeMap() {
  map.dragging.enable();
  map.scrollWheelZoom.enable();
  map.doubleClickZoom.enable();
  map.boxZoom.enable();
  map.keyboard.enable();
  map.touchZoom.enable();

  if (map.tap) map.tap.enable();
}

// Add tile layer 
L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; OpenStreetMap &copy; CartoDB', noWrap: true}
).addTo(map);

// -----CREATE LOCATIONS----- //
// Constructor function for easily making new pins
function Pin(title, latitude, longitude) {
	this.title = title
	this.coords = [latitude, longitude];

	// sets up this pin's accessbility ratings --> { userID: { ramps, doors, walkways, signage } }
	this.ratings = {};

	// sets up a thing to get the average of ratings
	this.ramps_average = 0;
	this.walkways_average = 0;
	this.doors_average = 0;
	this.signage_average = 0;

	// method to calculate average ratings
	this.computeAverages = function() {
		const allRatings = Object.values(this.ratings);

    let rampsSum = 0, rampsCount = 0;
    let walkwaysSum = 0, walkwaysCount = 0;
    let doorsSum = 0, doorsCount = 0;
    let signageSum = 0, signageCount = 0;

    allRatings.forEach(r => {
        if ("ramps" in r) {
            rampsSum += r.ramps ? 1 : 0;
            rampsCount++;
        }

        if ("walkways" in r) {
            walkwaysSum += r.walkways ? 1 : 0;
            walkwaysCount++;
        }

        if ("doors" in r) {
            doorsSum += r.doors ? 1 : 0;
            doorsCount++;
        }

        if ("signage" in r) {
            signageSum += r.signage ? 1 : 0;
            signageCount++;
        }
    });

    this.ramps_average = rampsCount ? Math.round((rampsSum / rampsCount) * 100) : 0;
    this.walkways_average = walkwaysCount ? Math.round((walkwaysSum / walkwaysCount) * 100) : 0;
    this.doors_average = doorsCount ? Math.round((doorsSum / doorsCount) * 100) : 0;
    this.signage_average = signageCount ? Math.round((signageSum / signageCount) * 100) : 0;
	}

	// setups this pin's marker
	this.marker = L.marker(this.coords, {alt: this.title, title: this.title})
	.addTo(map)
	.bindTooltip(`<h3>${this.title}</h3>`, {
  	direction: 'auto',
		permanent: false
	})
	.on('click', () => {
		if (isRatingMode) return; // completely ignore clicks while rating

		// If this pin is already targeted, un-target it and hide its details
    if (targetedLocation === this) {
      targetedLocation = "";
      LOCATION_NAME_DISPLAY.innerHTML = "Click on a map pin to show its details";
      LOCATION_RATINGS_DISPLAY.classList.add("hidden");
      return;
    }

    // Otherwise, select this pin and show its details
    targetedLocation = this;
    LOCATION_NAME_DISPLAY.innerHTML = this.title;
    LOCATION_RATINGS_DISPLAY.classList.remove("hidden");
 		map.flyTo(this.coords, 18);
 		// Update display using stored averages
    updateRatingsDisplay(this);
	});
}
// update ratings
function updateRatingsDisplay(pin) {
    rampsRating_display.innerHTML = pin.ramps_average + "%";
    walkwaysRating_display.innerHTML = pin.walkways_average + "%";
    doorsRating_display.innerHTML = pin.doors_average + "%";
    signageRating_display.innerHTML = pin.signage_average + "%";
}
// okay here we actually create the pins
	const WR = new Pin("PAREF Woodrose School", 14.399444, 121.012500);
	// for testing purposes
	WR.ratings["SAMPLE-USER-0"] = {
		ramps: false, 
		doors: true,
		walkways: true,
		signage: true
	};
	WR.ratings["SAMPLE-USER-1"] = {
		ramps: true, 
		doors: false,
		walkways: true,
		signage: false
	};
	WR.ratings["SAMPLE-USER-2"] = {
		ramps: true, 
		doors: true,
		walkways: true,
		signage: true
	};
	WR.computeAverages();
	const ACC = new Pin("Alabang Country Club", 14.4014, 121.0202);
	// for testing purposes
	ACC.ratings["SAMPLE-USER-0"] = {
		ramps: true, 
		doors: true,
		walkways: true,
		signage: false
	};
	ACC.ratings["SAMPLE-USER-1"] = {
		ramps: true, 
		doors: true,
		walkways: true,
		signage: true
	};
	ACC.ratings["SAMPLE-USER-2"] = {
		ramps: true, 
		doors: true,
		walkways: false,
		signage: false
	};
	ACC.computeAverages();

// -----RATING A LOCATION----- //
// the actual rating 
ratingForm.addEventListener("submit", function(event) {
	// Once submission is clicked:
	event.preventDefault(); // Prevent page reload

	// Read form values
  const newRating = {};

	["ramps", "doors", "walkways", "signage"].forEach(id => {
    const field = ratingForm[id];

    if (field.value === "true") {
        newRating[id] = true;
    } else if (field.value === "false") {
        newRating[id] = false;
    }
	});
  /*For testing purposes
  console.log("User submitted rating:", newRating);*/

  // Check if at least one field is true
  if (Object.keys(newRating).length === 0) {
    alert("Please answer at least one criterion before submitting.");
    return;
	}

  // Add rating to the targeted location's list
  targetedLocation.ratings[userID] = newRating;
  targetedLocation.computeAverages(true); // exclude blank ratings in recalc
  updateRatingsDisplay(targetedLocation);

  // Hide form again, show the rating button again
  RATING_CONTAINER.classList.add("hidden");
  START_BUTTON.classList.remove("hidden");

  // Reset form for next use and update display
  ratingForm.reset();
  map.eachLayer(layer => {
		if (layer instanceof L.Marker) {
    	layer.setOpacity(1);
		}
	});
  // Turn the map back on
  isRatingMode = false;
	unfreezeMap();
});

// visual stuff that runs when "rate location" button is pressed.
function rateLocation() {
	if (targetedLocation == "") {
		console.log("No selected location!")
	} else {
		/* zoom in on current location (NOTE TO SELF: add option to disable maybe)
		map.flyTo(targetedLocation.coords, 18);*/
		// hides the start button, shows the form, and updates the prompt with the location's title
		START_BUTTON.classList.add("hidden");
		RATING_CONTAINER.classList.remove("hidden");

		// Check if the user already rated this location
    const existingRating = targetedLocation.ratings[userID];
    if (existingRating) {
      PROMPT.innerHTML = "You've already rated this location! Updating rating for " + targetedLocation.title + ":";
      
      // Pre-fill the form with their previous answers
      ratingForm.ramps.value = existingRating.ramps.toString();
      ratingForm.doors.value = existingRating.doors.toString();
      ratingForm.walkways.value = existingRating.walkways.toString();
      ratingForm.signage.value = existingRating.signage.toString();
      ratingForm.querySelector("button[type='submit']").innerText = existingRating ? "Update Rating" : "Submit Rating";
    } else {
      PROMPT.innerHTML = "Rate " + targetedLocation.title + ":";
      
      // Resets form if first time rating
      ratingForm.reset();
    }; 

		// Turn off map scrolling
		isRatingMode = true;
    freezeMap()
    // Dim everything but the current pin
    targetedLocation.marker.setOpacity(1);
    map.eachLayer(layer => {
	    if (layer instanceof L.Marker && layer !== targetedLocation.marker) {
	      layer.setOpacity(0.4);
	    }
		});
  } 
}
// Informational tooltips!
const criteria = document.getElementById("ratingTooltip");
let activeButton = null
	// ? buttons
	const infoButtons = document.querySelectorAll(".info-btn");
	infoButtons.forEach(button => {	
		// If this button is already clicked, hide tooltip
	  button.addEventListener("click", (event) => {
	  	if (activeButton === button) {
	      criteria.classList.add("hidden");
	      activeButton = null;
	      return;
	    }
	    // Otherwise, show the tooltip
	    activeButton = button;
	    const infoText = button.dataset.info;
	    criteria.innerText = infoText;
	    criteria.classList.remove("hidden");
	  });
	});


// -----CREATURES SCREEN----- //
