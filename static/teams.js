$(document).ready(function() {
  var editIndex = null;
  var maxEvents = 5;

  // Resets the value of the name input to nothing
  $('.team-edit-name input').val("");

  // load header
  $(function(){
    $("#header").load("/partials/header.html"); 
  });

  function editBtn() {
    // Get the teamParticipants array from local storage
    var teamParticipants = JSON.parse(localStorage.getItem("teamParticipants"));
    // Find the object with the specified index
    var participant = null;
    $.each(teamParticipants, function(i, p) {
      if (p.indexID === editIndex) {
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
      var event = events.find(e => e.indexID === eventIndex);
      if (event) {
        $('.team-edit-events-list').append(`<p>${event.name} <span>${event.startTime}</span></p>`);
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
                      <button data-index="${participant.indexID}" class="edit-btn">Edit</button>
                      <button data-index="${participant.indexID}" class="del-btn">Delete</button>
                    </div>
                  </div>
                </div>`;

    $('.team-list').append(html);
  });

  // add participant to the local storage
  $('.add-participant-btn').on('click', function() {
    // Get the values from the input fields
    var teamName = "New Participant"
    
    // Get the existing participants from local storage, or create an empty array if it doesn't exist yet
    var teamParticipants = JSON.parse(localStorage.getItem('teamParticipants')) || [];
    
    // Find the highest index value currently in the array
    var maxIndex = 0;
    for (var i = 0; i < teamParticipants.length; i++) {
      if (teamParticipants[i].indexID > maxIndex) {
        maxIndex = teamParticipants[i].indexID;
      }
    }
    
    // Add the new team with the next index
    teamParticipants.push({
      indexID: maxIndex + 1,
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
      return team.indexID != index;
    });
    localStorage.setItem('teamParticipants', JSON.stringify(teamParticipants));
    // Reload the page
    location.reload();
  });

  // Edit participant name
  $('.confirm').click(function() {
    // Get the teamParticipants array from local storage
    var teamParticipants = JSON.parse(localStorage.getItem("teamParticipants"));
    // Find the JSON object with the specified index and update it
    $.each(teamParticipants, function(i, p) {
      if (p.indexID === editIndex) {
        p.name = $('.team-edit-name input').val();
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
    $('.events-list').empty();
    // get events and participants from local storage
    var teamEvents = JSON.parse(localStorage.getItem('teamEvents')) || [];

    var tickedBoxesCount = 0; // initialize the counter variable

    $.each(teamEvents, function(index, event) {
      var eventDiv = $('<div>');
      eventDiv.append('<div>' + event.name + '</div>');
      eventDiv.append('<div>' + event.startTime + '</div>');
      var checkbox = $('<input type="checkbox">');
      checkbox.attr('data-indexID', event.indexID);

      // checks if the editIndex (the participant being edited) is in the participants array
      // of the events and checks the box if they are
      if (event.participants.indexOf(editIndex) !== -1) {
        checkbox.prop('checked', true);
        tickedBoxesCount++; // increment the counter variable
      }

      $('.confirm-btn').text(`Confirm ${tickedBoxesCount} / ${maxEvents}`)

      checkbox.change(function() {
        if ($(this).is(':checked')) {
          tickedBoxesCount++;
        } else {
          tickedBoxesCount--;
        }
        console.log(tickedBoxesCount)
        $('.confirm-btn').text(`Confirm ${tickedBoxesCount} / ${maxEvents}`)
        if (tickedBoxesCount > maxEvents) {
          $('.confirm-btn').css('color', 'red').prop('disabled', true)
        } else {
          $('.confirm-btn').css('color', '').prop('disabled', false)
        }
      });

      $('.events-list').append(eventDiv);
      eventDiv.append(checkbox); // append the checkbox to the event div
    });

    // display the ticked boxes count
    console.log(tickedBoxesCount)

    $('.modify-event-popup-container').show();
  });

  // updates the participants's "events" arrays and events's "participant" arrays
  $(".confirm-btn").click(function() {
    var teamParticipants = JSON.parse(localStorage.getItem('teamParticipants')) || [];
    var teamEvents = JSON.parse(localStorage.getItem('teamEvents')) || [];

    // Get the array of event indexes from the checkboxes
    var eventIndexes = [];
    $('.events-list input[type="checkbox"]:checked').each(function() {
      eventIndexes.push(parseInt($(this).attr('data-indexid')));
    });

    console.log(eventIndexes)

    // Find the participant object with the matching indexID
    var participant = teamParticipants.find(function(p) {
      return p.indexID === editIndex;
    });

    console.log(participant)

    // Update the participant's "events" array
    participant.events = eventIndexes;

    console.log(participant)

    // Update the "participants" array of the corresponding event objects
    $.each(teamEvents, function(index, event) {
      if (eventIndexes.indexOf(event.indexID) !== -1) {
        if (event.participants.indexOf(editIndex) === -1) {
          event.participants.push(editIndex);
        }
      } else {
        event.participants = event.participants.filter(function(p) {
          return p !== editIndex;
        });
      }
    });

    console.log(teamEvents)

    // Save the updated data to local storage
    localStorage.setItem('teamParticipants', JSON.stringify(teamParticipants));
    localStorage.setItem('teamEvents', JSON.stringify(teamEvents));

    // Reset the right panel and hide the popup
    editBtn();
    $(".modify-event-popup-container").hide();
  });

  $(".close-btn").click(function() {
    $(".modify-event-popup-container").hide();
  });

  $(".cancel-btn").click(function() {
    $(".modify-event-popup-container").hide();
  });
});