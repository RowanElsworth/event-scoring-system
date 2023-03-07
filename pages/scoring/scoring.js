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

  $('.submit-btn').click(function() {
    // Get the index of the event to be edited
    var editIndex = parseInt($('.scores-btn').attr("data-index"));
  
    // Get the participant names from the select elements
    var firstPlace = $('#first').val();
    var secondPlace = $('#second').val();
    var thirdPlace = $('#third').val();
  
    // Get the participants of the selected event
    var indEvents = JSON.parse(localStorage.getItem('indEvents')) || [];
    var indParticipants = JSON.parse(localStorage.getItem('indParticipants'));
    var teamEvents = JSON.parse(localStorage.getItem('teamEvents')) || [];
    var teamParticipants = JSON.parse(localStorage.getItem('teamParticipants'));
    var events = [...indEvents, ...teamEvents];
    var event = events.find(event => event.index === editIndex);
    var participantIDs = event.participants; // [1, 2, 3, 4]

    if (event.type === "Individual") {
      // Find the participant objects and update the user score for the event
      participantIDs.forEach(participantID => {
        var participant = indParticipants.find(participant => participant.index === participantID);
        var event = participant.events.find(event => event.eventIndex === editIndex);
        if (participant.name === firstPlace) {
          event.userScore = 3;
        } else if (participant.name === secondPlace) {
          event.userScore = 2;
        } else if (participant.name === thirdPlace) {
          event.userScore = 1;
        }
        localStorage.setItem('indParticipants', JSON.stringify(indParticipants));
      });
    } else if (event.type === "Team") {
      participantIDs.forEach(participantID => {
        var team = teamParticipants.find(team => team.index === participantID);
        var scoreIndex = event.userScore.findIndex(score => score.index === participantID);
        if (team.name === firstPlace) {
          event.userScore[scoreIndex].userScore = 3;
        } else if (team.name === secondPlace) {
          event.userScore[scoreIndex].userScore = 2;
        } else if (team.name === thirdPlace) {
          event.userScore[scoreIndex].userScore = 1;
        }
      });
      localStorage.setItem('teamParticipants', JSON.stringify(teamParticipants));
    }
  
    // Update the events array in local storage with the new scores
    if (event.type === "Individual") {
      localStorage.setItem('indEvents', JSON.stringify(indEvents));
    } else if (event.type === "Team") {
      localStorage.setItem('teamEvents', JSON.stringify(teamEvents));
    }
  
    // Hide the add-score-popup-container
    $('.add-score-popup-container').hide();
  });

  // closes the popup if open
  $('.close-btn').click(function() {
    $('.add-score-popup-container').hide();
  })


});