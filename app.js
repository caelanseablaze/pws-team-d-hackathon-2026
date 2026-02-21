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
		"solid", "translucent", "glowing", "sparkly"
	]
	const EXPRESSIONS_LIST = [
		"happy", "whimsical", "sleepy"
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
	// set the next active navigation bar item. there are more navbar items than screens so its a separate loop
	for (navItemIndex = 0; navItemIndex < NAV_ITEMS.length; navItemIndex ++) {
		if (NAV_ITEMS[navItemIndex].classList.contains(screenName)) {
			NAV_ITEMS[navItemIndex].classList.add("active");
		} else {
			NAV_ITEMS[navItemIndex].classList.remove("active");
		}
	}

	// load map right
	if (screenName === "GAME_SCREEN") {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }

    // load info right
    if (screenName === "INFO_SCREEN") {
  		showInfo("accessibility");
	}
}

// -----CREATURE FOUNDATIONS----- //
// function to create a random blob
function Creature(origin) {
	this.name = RANDOM_NAME_LIST[randomInteger(0, RANDOM_NAME_LIST.length)];
	this.species = "blob";
	this.element = ELEMENT_LIST[randomInteger(0, ELEMENT_LIST.length)];
	this.color = randomInteger(1,3);
	this.style = STYLE_LIST[randomInteger(0, STYLE_LIST.length)];
	this.expression = EXPRESSIONS_LIST[randomInteger(0, EXPRESSIONS_LIST.length)];
	this.origin = origin;
	this.id = crypto.randomUUID();
}

// function to generate a blob icon. my magnum opus
function createBlobIcon(blob) {
    const container = document.createElement("div");
    container.classList.add("blob-container");

    // i dont like repeating code
		function addImageLayer(subfolder, filename, blend="") {
			const newLayer = document.createElement("img");
			newLayer.src = `blobs/${subfolder}/${filename}.PNG`;
			newLayer.classList.add("blob-layer", `${blend}BlendMode`);
			container.appendChild(newLayer);
		}

    // base
    addImageLayer("base", `${blob.element}${blob.color}`);

    // base shading only appears if non-glowy
    if (blob.style !== "glowing") {
    	addImageLayer("shading", "base-shade", "colorburn");
    	addImageLayer("shading", "base-light", "screen");
    }

    // translucent
    if (blob.style === "translucent") { 
      if (blob.element === "fire") {
      	addImageLayer("overlays", "translucent-shading", "colorburn");// shading layer
        addImageLayer("overlays", "fire-translucent-lighting", "screen");// lighting layer
      } else if (blob.element === "earth") {
      	addImageLayer("overlays", "earth-translucent-accent");// color correction layer
      	addImageLayer("overlays", "earth-translucent-shading", "colorburn");// shading layer
        addImageLayer("overlays", "earth-translucent-lighting", "screen");// lighting layer
      } else {
      	addImageLayer("overlays", "translucent-shading", "colorburn");// shading layer
        addImageLayer("overlays", "translucent-lighting", "screen");// lighting layer
      }
    }
    // glowing
    if (blob.style === "glowing") { 
    	addImageLayer("overlays", `${blob.element}-glow`, "screen")
    }
    // sparkly
    if (blob.style === "sparkly") {
    	if (blob.element === "fire") {
    		addImageLayer("overlays", "fire-sparkly-texture", "overlay");
    	} else {
    		addImageLayer("overlays", "sparkly-texture", "overlay");
    	}
    	addImageLayer("overlays", "sparkly-sparkles", "screen");
    }

    // expressions are named using their name
    addImageLayer("expressions", `${blob.expression}`);

    // outline for good measure
    if (blob.element === "fire") {
    	addImageLayer("outline", "fire-outline");
    } else if (blob.element === "earth") {
    	addImageLayer("outline", "earth-outline");
    } else {
    	addImageLayer("outline", "outline");
    }

    return container;
}
// generates a bunch of blobs for that one bit on the home screen
for (i = 0; i < 4; i++) {
	const display = document.getElementById("randomblobdisplay");
	const randomblob = createBlobIcon(new Creature(""));
	display.appendChild(randomblob)
};

// -----FUNCTION FOR LOADING CREATURES ON CREATURE SCREEN----- //
function loadCreatures() {
	// reset previous creature screen 
	CREATURES_DISPLAY.innerHTML = "";
	CREATURES_NAVIGATION.innerHTML = "";

	// creates a new card + icon for every blob
	for (let i = 0; i < myCreatures.length; i++) {
		creature = myCreatures[i]
		// add navigation icon thing
		const icon = document.createElement("div");
		icon.innerHTML = `<span>${creature.name}</span>`;
		icon.appendChild(createBlobIcon(creature));
		icon.classList.add("scrollIcon", `${creature.id}`);
		CREATURES_NAVIGATION.appendChild(icon);

		// add details card
		const card = document.createElement("div");
		card.classList.add("creature-card", `${creature.id}`, "hidden");
		card.innerHTML = `
		    <h3>${creature.name}</h3>
		    <p><b>Species:</b> <img src="images/${creature.species}-icon.PNG" alt="${creature.species} icon" class="elementicon"> ${creature.species}</p>
		    <p><b>Element:</b> <img src="images/${creature.element}-icon.PNG" alt="${creature.element} icon" class="elementicon"> ${creature.element}</p>
		    <p><b>Style:</b> ${creature.style}</p>
		    <p><b>Origin:</b> ${creature.origin}</p>
	    `;
	    CREATURES_DISPLAY.appendChild(card);
	}

	// shows the first card so the screen isnt suspiciously empty
	const allCards = document.querySelectorAll("#creatureDisplay .creature-card");
	allCards[0].classList.remove("hidden");
}

// -----USER INVENTORY AND CREATURES ----- //
myCreatures = [new Creature("A wonderful place"), new Creature("A nice place"), new Creature("An amazing place"),
new Creature("A wonderful place"), new Creature("A nice place"), new Creature("An amazing place")];
// -----MAP SETUP----- //
// Set up map
var map = L.map('map', {
    minZoom: 10, 
    maxZoom: 18  
}).setView([14.399444, 121.012500], 18);

// Defines some map functions 
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
	this.title = title;
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
	// Update display
    updateRatingsDisplay(this);
	});
}
// Function to update ratings for a pin
function updateRatingsDisplay(pin) {
	function updateBar(fillId, textId, value) {
        document.getElementById(fillId).style.width = value + "%";
        document.getElementById(textId).innerText = value + "%";
    }

    updateBar("rampsFill", "rampsText", pin.ramps_average);
    updateBar("walkwaysFill", "walkwaysText", pin.walkways_average);
    updateBar("doorsFill", "doorsText", pin.doors_average);
    updateBar("signageFill", "signageText", pin.signage_average);
}
// okay here we actually create the pins
	const WR = new Pin("PAREF Woodrose School", 14.399444, 121.012500);
	// for testing purposes
	WR.ratings["SAMPLE-USER-0"] = {ramps: false, doors: true, walkways: true, signage: true};
	WR.ratings["SAMPLE-USER-1"] = {ramps: true, doors: false, walkways: true, signage: false};
	WR.ratings["SAMPLE-USER-2"] = {ramps: true, doors: true, walkways: true, signage: true};
	WR.computeAverages();
	const ACC = new Pin("Alabang Country Club", 14.4014, 121.0202);
	// for testing purposes
	ACC.ratings["SAMPLE-USER-0"] = {ramps: false, doors: false, walkways: false, signage: false};
	ACC.ratings["SAMPLE-USER-1"] = {ramps: true, doors: false, walkways: false, signage: true};
	ACC.ratings["SAMPLE-USER-2"] = {ramps: true, doors: true, walkways: true, signage: true};
	ACC.computeAverages();

// -----RATING A LOCATION----- //
// the actual rating listener
ratingForm.addEventListener("submit", function(event) {
	function isCompleteRating(rating) {
	    return ["ramps", "doors", "walkways", "signage"].every(field => field in rating);
	}
	// Once submission is clicked:
	event.preventDefault(); // Prevent page reload
	const newRating = {};

	// read rating
	["ramps", "doors", "walkways", "signage"].forEach(id => {
	    const field = ratingForm[id];

	    if (field.value === "true") {
	        newRating[id] = true;
	    } else if (field.value === "false") {
	        newRating[id] = false;
	    }
	});

	// Check if at least one field is true
	if (Object.keys(newRating).length === 0) {
		alert("Please answer at least one criterion before submitting.");
		return;
	}

	// give blob if rating is complete or rating has been updated to be complete
	const previousRating = targetedLocation.ratings[userID];
	// pretty sure this says if the previous rating was not complete or didn't exist AND the new rating is complete
	if (!(previousRating ? isCompleteRating(previousRating) : false) && isCompleteRating(newRating)) {
		const newCreature = new Creature(targetedLocation.title);
		myCreatures.push(newCreature);

		// create a little announcement
		const announcement = document.createElement("div");
		announcement.classList.add("row", "newBlobAnnouncementBox");
		const announcementText = document.createElement("span");
		announcementText.classList.add("column", "newBlobAnnouncementText");

		// create one of those icons
		const icon = document.createElement("div");
		icon.innerHTML = `<span>${newCreature.name}</span>`;
		icon.appendChild(createBlobIcon(newCreature));
		icon.classList.add("scrollIcon", "column");
		announcement.appendChild(icon);

		// create one of those text
		announcementText.innerHTML = `
			For submitting your first complete rating for ${targetedLocation.title}, you obtained a new creature!
			<br>
			<br>You got a ${newCreature.style} ${newCreature.element} ${newCreature.species} 
			named "${newCreature.name}." 
			<br>It's feeling ${newCreature.expression}!
			<br>
			<br>You can see your creatures in the <a onclick="openScreen('CREATURE_SCREEN'); loadCreatures()">Creatures page</a>. 
			Clicking anywhere on this panel closes it.
			Thank you for your contribution!
		`;
		announcement.appendChild(announcementText);

		// push it to the HTML
		SCREENS.GAME_SCREEN.appendChild(announcement)
	}

	// Add rating to the targeted location's list
	targetedLocation.ratings[userID] = newRating;
	targetedLocation.computeAverages(); // exclude blank ratings in recalc
	updateRatingsDisplay(targetedLocation);

	// Hide form again, show the rating button again
	RATING_CONTAINER.classList.add("hidden");
	START_BUTTON.classList.remove("hidden");

	// Reset form for next use and update display
	ratingForm.reset();
	map.eachLayer(layer => {
		if (layer instanceof L.Marker) {layer.setOpacity(1);}
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
		// hides the start button, shows the form, and updates the prompt with the location's title
		START_BUTTON.classList.add("hidden");
		RATING_CONTAINER.classList.remove("hidden");

		// Check if the user already rated this location
		const existingRating = targetedLocation.ratings[userID];
		if (existingRating) {
      	PROMPT.innerHTML = "You've already rated this location!<br>Updating rating for " + targetedLocation.title + ":";
      
		// Pre-fill the form with their previous answers
		ratingForm.ramps.value = (typeof existingRating.ramps !== "undefined") ? existingRating.ramps.toString() : '';
		ratingForm.doors.value = (typeof existingRating.doors !== "undefined") ? existingRating.doors.toString() : '';
		ratingForm.walkways.value = (typeof existingRating.walkways !== "undefined") ? existingRating.walkways.toString(): '';
		ratingForm.signage.value = (typeof existingRating.signage !== "undefined") ? existingRating.signage.toString(): '';
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
// Informational tooltips! *ignore the naming i rewrote some parts and i don't wanna break the code
const tooltipBox = document.getElementById("ratingTooltip");
let activeButton = null;

document.addEventListener("click", function(event) {
    const button = event.target.closest(".info-btn");
    if (!button) {
        tooltipBox.classList.add("hidden");
        activeButton = null;
        return;
    }
    //activeButton = button; **this isnt here anymore
    tooltipBox.innerHTML = button.dataset.info;

    const rect = button.getBoundingClientRect();

    let left = window.scrollX + rect.left;
    let top = window.scrollY + rect.bottom + 6;

    tooltipBox.style.top = top + "px";
    tooltipBox.style.left = left + "px";

    tooltipBox.classList.remove("hidden");
});

// legitimately have nowhere else to put this. Announcement Disappear
document.addEventListener("click", function(event) {
	const announcementToEnd = event.target.closest(".newBlobAnnouncementBox");
	if (!announcementToEnd) {
		return;
	}
	announcementToEnd.remove();
});

// -----CREATURES SCREEN----- //

// showing and hiding cards
document.addEventListener("click", function(event) {
	const clickedIcon = event.target.closest("#creatureNavigation .scrollIcon");
	if (!clickedIcon) {
		return
	}
	const allCards = document.querySelectorAll("#creatureDisplay .creature-card");
	const clickedID = clickedIcon.classList[1]
	for (card = 0; card < allCards.length; card++) {
		let currentCardID = allCards[card].classList[1]
		if (currentCardID === clickedID) {
			allCards[card].classList.remove("hidden");
		} else {
			allCards[card].classList.add("hidden");
		}
	}
});

// -----INFORMATION SCREEN----- //
function showInfo(type) {
	const tutorial = document.getElementById("tutorialArticle");
	const accessibility = document.getElementById("accessibilityArticle");

	const tutorialBtn = document.getElementById("tutorialBtn");
	const accessibilityBtn = document.getElementById("accessibilityBtn");

	if (type === "tutorial") {
		tutorial.classList.remove("hidden");
		accessibility.classList.add("hidden");

		tutorialBtn.classList.add("active");
		accessibilityBtn.classList.remove("active");
	} else if (type === "accessibility") {
		accessibility.classList.remove("hidden");
		tutorial.classList.add("hidden");

		accessibilityBtn.classList.add("active");
		tutorialBtn.classList.remove("active");
	}
}

// ----- resizing map ----- //
let resizeTimeout;

window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!document.getElementById("gameScreen").classList.contains("hidden")) {
            map.invalidateSize();
            console.log(map.getSize());
        }
    }, 150);
});

// ----- TIME TO LOCK IN ------ //
window.addEventListener('load', function () {
  openScreen("HOME_SCREEN");
})