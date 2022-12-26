const minsInAYear = 60 * 24 * 365;

// import ical
const ical = require("node-ical");

// use the sync function parseFile() to parse this ics file
const data = ical.sync.parseFile("calendar.ics");

// get the events in reverse chronological order
const events = Object.values(data).reverse();

// get the start time of the window
const timeWindowStart = new Date("January 1, 2022");
const timeWindowEnd = new Date("December 31, 2022 23:59:59");

// get events that are within the time window
const eventsThisYear = events.filter(event => new Date(event.start) > timeWindowStart && new Date(event.end) < timeWindowEnd);

function analyze() {
    // log total events in calendar
    console.log(`You logged ${eventsThisYear.length.toLocaleString()} events this year.`);
    console.log();

    // log healthy events
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "workout"), "worked out");
    logTimeStats(getEventsByName(eventsThisYear, "walk"), "went walking");
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "hike"), "went hiking");

    // log media consumption
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "read"), "read");
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "watch youtube"), "watched YouTube");
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "watch tv"), "watched TV");
    
    // log cooking
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "cook"), "cooked");
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "make food"), "made food");

    // log boring tasks
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "eat"), "ate");
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "transit"), "spent time in transit");
    console.log();

    // log the time spent with people
    logTimeStats(getEventsByFuzzyName(eventsThisYear, "hang"), "hung out with friends");
    logPeopleTime(eventsThisYear, [
        "Mom",
        "Dad"
    ]);
}

analyze();

/**
 * Log the person time for an array of people.
 * @param {object[]} events 
 * @param {string[]} people 
 */
function logPeopleTime(events, people) {
    people.map(person => logPersonTime(events, person));
}

/**
 * Log the amount of time spent with a person in a year.
 * @param {object[]} events 
 * @param {string} name 
 */
function logPersonTime(events, name) {
    logTimeStats(getEventsWithPerson(events, name), `hung out with ${name}`);
}

/**
 * Log the mins, hours, and percent of year a group of events was.
 * @param {object[]} events 
 * @param {string} action 
 */
function logTimeStats(events, action) {
    const mins = getCumulativeEventDuration(events);
    const hours = (mins / 60).toFixed(2);

    console.log(`You ${action} ${events.length} times for ${mins.toLocaleString()} minutes or ${hours.toLocaleString()} hours. This accounts for ${getPercentOfYear(mins)}% of the year.`);
}

/**
 * Get the duration of an event in minutes.
 * @param {object} event - iCal event object
 * @returns {number} duration - in minutes
 */
function getEventDuration(event) {
    // get milliseconds elapsed during the event
    const millisElapsed = new Date(event.end).getTime() - new Date(event.start).getTime();

    return millisElapsed / (1000 * 60);
}

/**
 * Get the percentage the duration is out of the year.
 * @param {number} duration 
 * @returns {number} percentageOfYear
 */
function getPercentOfYear(duration) {
    return (100 * duration / minsInAYear).toFixed(2);
}

/**
 * Get the cumulative duration of events of a similar type.
 * @param {object[]} events - list of events of a similar type
 * @returns {number} cumulativeDuration - the duration of all the events together
 */
function getCumulativeEventDuration(events) {
    return events.map(getEventDuration).reduce((a, b) => a + b);
}

/**
 * Get all events with a specific person.
 * @param {object[]} events 
 * @param {string[]} name 
 * @returns {object[]} eventsWithPerson
 */
function getEventsWithPerson(events, name) {
    return events.filter(event => {
        // if the event title has people's names in it
        if (event.summary && event.summary.includes("w/"))
        {
            const attendeesRaw = event.summary.substring(event.summary.indexOf("w/") + 3);
            const attendeesProcessed = attendeesRaw
                .replaceAll("&", ", ")
                .replaceAll("+", ", ")
                .split(", ")
                .filter(x => x).map(x => x.toLowerCase().trim());

            return attendeesProcessed.includes(name.toLowerCase());
        }

        return false;
    });
}

/**
 * Get a list of events with the same name.
 * @param {object[]} events 
 * @param {string} name 
 * @returns {object[]} eventsWithName
 */
function getEventsByName(events, name) {
    return events.filter(event => event?.summary == name);
}

/**
 * Get a list of events that include the text in the name.
 * @param {object[]} events 
 * @param {string} name 
 * @returns {object[]} eventsWithFuzzyName
 */
function getEventsByFuzzyName(events, name) {
    return events.filter(event => event?.summary.includes(name));
}