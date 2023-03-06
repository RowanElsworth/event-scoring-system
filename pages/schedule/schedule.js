$(document).ready(function() {
  updateNextEvent();
  updateEventList();

  // load header
  $(function(){
    $("#header").load("../../partials/header.html"); 
  });
  
  // authentication check
  if (!localStorage.getItem('user')) {
    // redirect to login page if not authenticated
    window.location.href = '/pages/auth/auth.html';
  }
  
  function updateNextEvent() {
    let events = JSON.parse(localStorage.getItem('events'))
    var currentTime = new Date();
    var nextEvent = null;
    var nextEventTime = null;
    
    // Loop through all events
    $.each(events, function(index, event) {
      var eventTime = new Date();
      var timeParts = event.startTime.split(':');
      eventTime.setHours(timeParts[0]);
      eventTime.setMinutes(timeParts[1]);
      
      // If event is in the future and sooner than the current next event, set it as the new next event
      if (eventTime > currentTime && (nextEventTime == null || eventTime < nextEventTime)) {
        nextEvent = event;
        nextEventTime = eventTime;
      }
    });
    
    // Update the DOM only if nextEvent is not null
    if (nextEvent) {
      $('.event-type').html(`${nextEvent.type}`);
      $('.event-name').html(`<span>${nextEvent.name}</span> @ ${nextEvent.startTime}`);
      // Empty the event-participants div before appending the participants of the next event
      $('.event-participants').empty();
      // Append participants of next event one by one to the upcoming-events-list
      $.each(nextEvent.participants, function(index, participant) {
        $('.event-participants').append(`<p>${participant}</p>`);
      });
    }
  };
  
  
  // Call the updateNextEvent function every minute
  setInterval(updateNextEvent, 60000);  
  
  function updateEventList() {
      let events = JSON.parse(localStorage.getItem('events'))
      var currentTime = new Date();
      var upcomingEvents = [];
  
      // Loop through all events
      $.each(events, function(index, event) {
        var eventTime = new Date();
        // Split the start time string into hours and minutes
        var timeParts = event.startTime.split(':');
        // Set the hours and minutes of the event time object
        eventTime.setHours(timeParts[0]);
        eventTime.setMinutes(timeParts[1]);
  
        // Check if the event is in the future
        if (eventTime > currentTime) {
          upcomingEvents.push(event);
        }
      });
  
      // Sort the upcoming events array by start time in ascending order
      upcomingEvents.sort(function(a, b) {
        var timePartsA = a.startTime.split(':');
        var timePartsB = b.startTime.split(':');
        var timeA = new Date();
        var timeB = new Date();
        timeA.setHours(timePartsA[0]);
        timeA.setMinutes(timePartsA[1]);
        timeB.setHours(timePartsB[0]);
        timeB.setMinutes(timePartsB[1]);
        return timeA - timeB;
      });
  
      // Clear the existing event list
      $('.upcoming-events-list').empty();
  
      // Loop through all upcoming events and add them to the event list
      $.each(upcomingEvents, function(index, event) {
        var eventHtml = `<p><span>${event.type}</span> ${event.name} <span>${event.startTime}</span></p>`;
        $('.upcoming-events-list').append(eventHtml);
      });
    };
  // Call the updateUpcomingEvents function every minute
  setInterval(updateEventList, 60000);
    
});
  
