$(document).ready(function() {

  var editIndex;

  // load header
  $(function(){
    $("#header").load("../../partials/header.html"); 
  });
  
  // authentication check
  if (!localStorage.getItem('user')) {
    // redirect to login page if not authenticated
    window.location.href = '/pages/auth/auth.html';
  }
  
  let indEvents = JSON.parse(localStorage.getItem('indEvents')) || [];
  let teamEvents = JSON.parse(localStorage.getItem('teamEvents')) || [];
  let events = [...indEvents, ...teamEvents].sort((a, b) => a.name.localeCompare(b.name));
  
  $.each(events, function(index, event) {
    var eventTypeClass = event.type === "Team" ? ".team-table-container" : ".ind-table-container";
    var html = `
      <div class="row">
        <div class="cols">
          <div class="col-left">
            <div class="event-name">
              <p>${event.name}</p>
            </div>
          </div>
          <div class="col-right">
            <div class="event-start-controls">
              <p>${event.startTime}</p>
              <button class="scores-btn" data-index="${event.index}">Add/Modify Scores</button>
            </div>
          </div>
        </div>
      </div>
    `;
    $(eventTypeClass).append(html);
  });
    
  // Show the popup and dynamically populate the input options based on the event participants
  $('.scores-btn').click(function() {
    // Get the index of the event to be edited
    var editIndex = $(this).attr("data-index");
    editIndex = parseInt(editIndex);

    // Get the participants of the selected event
    var indEvents = JSON.parse(localStorage.getItem('indEvents')) || [];
    var teamEvents = JSON.parse(localStorage.getItem('teamEvents')) || [];
    var events = [...indEvents, ...teamEvents];
    var event = events.find(event => event.index === editIndex);

    $('.event-info').text(`${event.name} @ ${event.startTime}`)
    var participantIDs = event.participants;
    participantIDs.sort(function(a, b) {
      return a - b;
    });

    // Get the names of the participants from the appropriate local storage
    var participantNames = [];
    if (event.type === "Individual") {
      var indParticipants = JSON.parse(localStorage.getItem('indParticipants'));
      participantNames = participantIDs.map(participantID => {
        var participant = indParticipants.find(participant => participant.index === participantID);
        return participant.name;
      });
    } else if (event.type === "Team") {
      var teamParticipants = JSON.parse(localStorage.getItem('teamParticipants'));
      participantNames = participantIDs.map(participantID => {
        var team = teamParticipants.find(team => team.index === participantID);
        return team.name;
      });
    }

    // Sort the participant names array in alphabetical order
    $('#first, #second, #third').empty();
    participantNames.sort();

    // Dynamically create the options for the select elements and add them to the DOM
    participantNames.forEach(function(name) {
      var option = $('<option>', {text: name});
      $('#first, #second, #third').append(option);
    });

    // Show the add-score-popup-container
    $('.add-score-popup-container').show();
  });

  // closes the popup if open
  $('.close-btn').click(function() {
    $('.add-score-popup-container').hide();
  })


});