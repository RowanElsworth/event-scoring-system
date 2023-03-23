$(document).ready(function() {
  var editIndex = null;
  var maxEvents = 5;

  // Resets the value of the name input to nothing
  $('.team-edit-name input').val("");

  // load header
  $(function(){
    $("#header").load("../../partials/header.html"); 
  });
  
  // authentication check
  if (!localStorage.getItem('user')) {
    // redirect to login page if not authenticated
    window.location.href = '/pages/auth/auth.html';
  }
  
  function editBtn() {
    // Get the teamParticipants array from local storage
    var teamParticipants = JSON.parse(localStorage.getItem("teamParticipants"));
    // Find the object with the specified index
    var participant = null;
    $.each(teamParticipants, function(i, p) {
      if (p.index === editIndex) {
        participant = p;
        return false;
      }
    });
    // Use the participant variable as needed
    $('.team-edit-name input').val(participant.name)
    $('.team-edit-events-title').text(`Events: ${participant.events.length}/${maxEvents}`)
    $('.team-edit-events-list').empty()

    // Find events with matching indexes and append their names to the events list
    var events = JSON.parse(localStorage.getItem("indEvents"));
    $.each(participant.events, function(i, eventIndex) {
      var event = events.find(e => e.index === eventIndex);
      if (event) {
        $('.ind-edit-events-list').append(`<p>${event.name} <span>${event.startTime}</span></p>`);
      }
    });
  }

  // Read the teamParticipants array from local storage
  var teamParticipants = JSON.parse(localStorage.getItem('teamParticipants')) || [];
  
  // Sort the array alphabetically by name
  teamParticipants.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });
  
  // Loop through the array and append HTML elements to .team-list
  $.each(teamParticipants, function(index, participant) {
    var html = `<div class="row">
                  <div class="split">
                    <div class="team-name">
                      <p>${participant.name}</p>
                    </div>
                    <div class="btns">
                      <button data-index="${participant.index}" class="edit-btn">Edit</button>
                      <button data-index="${participant.index}" class="del-btn">Delete</button>
                    </div>
                  </div>
                </div>`;

    $('.team-list').append(html);
  });

  // add participant to the local storage
  $('.add-part-btn').on('click', function() {
    // Get the values from the input fields
    var teamName = "New Participant"
    
    // Get the existing participants from local storage, or create an empty array if it doesn't exist yet
    var teamParticipants = JSON.parse(localStorage.getItem('teamParticipants')) || [];
    
    // Find the highest index value currently in the array
    var maxIndex = 0;
    for (var i = 0; i < teamParticipants.length; i++) {
      if (teamParticipants[i].index > maxIndex) {
        maxIndex = teamParticipants[i].index;
      }
    }
    
    // Add the new team with the next index
    teamParticipants.push({
      index: maxIndex + 1,
      name: teamName,
      events: []
    });
    
    // Save the updated participants to local storage
    localStorage.setItem('teamParticipants', JSON.stringify(teamParticipants));
    
    // Reload the page
    location.reload();
  });
  
  // Edits participant
  $('.edit-btn').click(function() {
    // Get the index from the data-index attribute
    var index = $(this).data("index");
    editIndex = index;
    editBtn()
  });

  // Removes participant
  $('.del-btn').click(function() {
    var index = $(this).attr('data-index');
    var teamParticipants = JSON.parse(localStorage.getItem('teamParticipants'));
    teamParticipants = teamParticipants.filter(function(team) {
      return team.index != index;
    });
    localStorage.setItem('teamParticipants', JSON.stringify(teamParticipants));
    // Reload the page
    location.reload();
  });
  
  // Edit participant
  $('.confirm').click(function() {
    // Get the teamParticipants array from local storage
    var teamParticipants = JSON.parse(localStorage.getItem("teamParticipants"));
    // Find the JSON object with the specified index and update it
    $.each(teamParticipants, function(i, p) {
      if (p.index === editIndex) {
        p.name = $('.team-edit-name input').val();
        p.events = [];
        return false;
      }
    });
    // Save the updated teamParticipants array back to local storage
    localStorage.setItem("teamParticipants", JSON.stringify(teamParticipants));
    // Reload the page
    location.reload();
  });

  // Edit participant events - shows pop up and displays events
  $('.team-edit-events-btn').on('click', function() {
    var teamEvents = JSON.parse(localStorage.getItem('teamEvents'));
    var participant = JSON.parse(localStorage.getItem('teamParticipants')).find(function(p) {
      return p.index === editIndex;
    });
  
    $('.events-list').empty(); // Clear the list before appending
  
    teamEvents.forEach(function(event) {
      var isChecked = false;
      if (participant) {
        participant.events.forEach(function(pEvent) {
          if (pEvent === event.index) {
            isChecked = true;
            return false; // Exit the forEach loop early
          }
        });
      }
      var checkbox = $('<input>').attr({
        type: 'checkbox',
        'data-index': event.index,
        checked: isChecked
      });
      var eventName = $('<p>').text(event.name);
      var eventTime = $('<p>').text(event.startTime);
      var eventContainer = $('<div>').append(eventName, eventTime, checkbox);
      $('.events-list').append(eventContainer);
    });
    $(".modify-event-popup-container").show();
  });

  // Pushes events to participants events
  $('.confirm-btn').click(function() {
    // Get the checked checkboxes and their data-index values
    var checkedBoxes = $('.events-list input:checked');
    var checkedIndices = [];
    checkedBoxes.each(function() {
      checkedIndices.push($(this).data('index'));
    });

    // Get the events array from local storage
    var events = JSON.parse(localStorage.getItem('teamEvents'));

    // Update the participants array of the selected events
    for (var i = 0; i < events.length; i++) {
      var eventIndex = events[i].index;
      var eventParticipants = events[i].participants;

      // Remove the participant from the event if it's unchecked
      if (!checkedIndices.includes(eventIndex) && eventParticipants.includes(editIndex)) {
        eventParticipants.splice(eventParticipants.indexOf(editIndex), 1);
      }

      // Add the participant to the event if it's checked and not already there
      else if (checkedIndices.includes(eventIndex) && !eventParticipants.includes(editIndex)) {
        eventParticipants.push(editIndex);
      }
    }

    // Save the updated events array to local storage
    localStorage.setItem('teamEvents', JSON.stringify(events));

    // Get the participants array from local storage
    var participants = JSON.parse(localStorage.getItem('teamParticipants'));

    // Find the participant with the editIndex and update its events array
    for (var i = 0; i < participants.length; i++) {
      if (participants[i].index === editIndex) {
        var events = [];
        $.each(checkedIndices, function(index, eventIndex) {
          events.push({
            eventIndex: eventIndex,
            userScore: 0
          });
        });
        participants[i].events = events;
        break;
      }
    }

    // Save the updated participants array to local storage
    localStorage.setItem('teamParticipants', JSON.stringify(participants));

    // Reload the page
    location.reload();
  });
  
  $(".close-btn").click(function() {
    $(".modify-event-popup-container").hide();
  });

  $(".cancel-btn").click(function() {
    $(".modify-event-popup-container").hide();
  });
});