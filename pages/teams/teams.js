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
    var events = JSON.parse(localStorage.getItem("teamEvents"));
    $.each(participant.events, function(i, eventIndex) {
      var event = events.find(e => e.index === eventIndex);
      if (event) {
        $('.team-edit-events-list').append(`<p>${event.name} <span>${event.startTime}</span></p>`);
      }
    });
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
  $('.team-edit-events-btn').click(function() {
    if (editIndex !== null) { // so it can't be opened without an edit index
      $(".modify-event-popup-container").show();
      $('.events-list').empty()
      // Get the events array from local storage
      const events = JSON.parse(localStorage.getItem("teamEvents"));
      // Get the participant from local storage
      const teamParticipants = JSON.parse(localStorage.getItem("teamParticipants"));
      let participant = null;
      $.each(teamParticipants, function(i, p) {
        if (p.index === editIndex) {
          participant = p;
          return false;
        }
      });
      // Loop through the events array and append each event with type "Team" to the events list
      let selectedCount = 0;
      $.each(events, function(index, event) {
        if (event.type === "Team") {
          // Create a new div to hold the event information
          const eventDiv = $(`<div>`);
          // Add the event name and start time to the div
          eventDiv.append(`<p>${event.name}</p>`);
          eventDiv.append(`<p>${event.startTime}</p>`);
          // Add a checkbox to the div with the data-index attribute set to the event index
          const checkbox = $(`<input type="checkbox" data-index="${event.index}">`);
          // Check the checkbox if the participant is already participating in the event
          const eventIndex = participant.events.findIndex(e => e.eventIndex === event.index.toString());
          if (eventIndex !== -1) {
            checkbox.prop('checked', true);
          }
          // Count the number of selected checkboxes
          checkbox.on('change', function() {
            if (this.checked) {
              selectedCount++;
              // Add the event to the participant's list of events if it is checked
              participant.events.push({eventIndex: event.index});
            } else {
              selectedCount--;
              // Remove the event from the participant's list of events if it is unchecked
              const eventIndex = participant.events.findIndex(e => e.eventIndex === event.index);
              if (eventIndex !== -1) {
                participant.events.splice(eventIndex, 1);
              }
            }
            if (selectedCount > maxEvents) {
              $('.confirm-btn').text(`Too many events ${selectedCount}/${maxEvents}`).css('color', 'red').prop('disabled', true);
            } else {
              $('.confirm-btn').text(`Confirm ${selectedCount}/${maxEvents}`).css('color', 'black').prop('disabled', false);
            }
          });
          eventDiv.append(checkbox);
          // Append the event div to the events list
          $(".events-list").append(eventDiv);
        }
      });

      // Initialize the button text based on the number of pre-selected events
      selectedCount = $('.events-list input:checked').length;
      if (selectedCount > maxEvents) {
        $('.confirm-btn').text(`Too many events ${selectedCount}/${maxEvents}`).css('color', 'red').prop('disabled', true);
      } else {
        $('.confirm-btn').text(`Confirm ${selectedCount}/${maxEvents}`).prop('disabled', false);
      }
      
    };
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
          events.push(eventIndex);
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