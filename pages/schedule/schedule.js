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
    let indEvents = JSON.parse(localStorage.getItem('indEvents')) || [];
    let teamEvents = JSON.parse(localStorage.getItem('teamEvents')) || [];
    let indParticipants = JSON.parse(localStorage.getItem('indParticipants')) || [];
    let teamParticipants = JSON.parse(localStorage.getItem('teamParticipants')) || [];
    let currentTime = new Date();
    let nextEvent = null;
    let nextEventTime = null;
  
    // Combine individual and team events into one array
    let events = [...indEvents, ...teamEvents];

    // Loop through all events
    $.each(events, function(index, event) {
      let eventTime = new Date();
      let timeParts = event.startTime.split(':');
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
      $('.event-participants').html(`<p>Participants:</p>`);
      $.each(nextEvent.participants, function(index, participantIndex) {
        let participantName = '';
        if (nextEvent.type === 'Individual') {
          let participant = indParticipants.find(p => p.index === participantIndex);
          if (participant) {
            participantName = participant.name;
          }
        } else if (nextEvent.type === 'Team') {
          let participant = teamParticipants.find(p => p.index === participantIndex);
          if (participant) {
            participantName = participant.name;
          }
        }
        $('.event-participants').append(`<p>${participantName}</p>`);
      });
    } else {
      $('.event-name').html(`<span>No upcoming events`);
    }
    
  };


  // Call the updateNextEvent function every minute
  setInterval(updateNextEvent, 60000);  
  
  function updateEventList() {
    let indEvents = JSON.parse(localStorage.getItem('indEvents'));
    let teamEvents = JSON.parse(localStorage.getItem('teamEvents'));
    let currentTime = new Date();
    let upcomingEvents = [];
  
    // Loop through all individual events
    $.each(indEvents, function(index, event) {
      let eventTime = new Date();
      let timeParts = event.startTime.split(':');
      eventTime.setHours(timeParts[0]);
      eventTime.setMinutes(timeParts[1]);
  
      // Check if the event is in the future
      if (eventTime > currentTime) {
        upcomingEvents.push(event);
      }
    });
  
    // Loop through all team events
    $.each(teamEvents, function(index, event) {
      let eventTime = new Date();
      let timeParts = event.startTime.split(':');
      eventTime.setHours(timeParts[0]);
      eventTime.setMinutes(timeParts[1]);
  
      // Check if the event is in the future
      if (eventTime > currentTime) {
        upcomingEvents.push(event);
      }
    });
  
    // Sort the upcoming events array by start time in ascending order
    upcomingEvents.sort(function(a, b) {
      let timePartsA = a.startTime.split(':');
      let timePartsB = b.startTime.split(':');
      let timeA = new Date();
      let timeB = new Date();
      timeA.setHours(timePartsA[0]);
      timeA.setMinutes(timePartsA[1]);
      timeB.setHours(timePartsB[0]);
      timeB.setMinutes(timePartsB[1]);
      return timeA - timeB;
    });
  
    // Clear the existing event list
    $('.upcoming-events-list').empty();
  
    // Loop through all upcoming events and add them to the event list
    if (upcomingEvents) {
      $.each(upcomingEvents, function(index, event) {
        let eventHtml = `<p><span>${event.type}</span> ${event.name} <span>${event.startTime}</span></p>`;
        $('.upcoming-events-list').append(eventHtml);
      });
    } else {
      $('.upcoming-events-list').html(`<p>No upcoming events</p>`);
    }

  };
  
  // Call the updateUpcomingEvents function every minute
  setInterval(updateEventList, 60000);
    
});
  