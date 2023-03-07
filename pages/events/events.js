$(document).ready(function() {
  // sets up the variable, because I can't think of a better way of doing it lol
  var eventType;
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

  // Out puts the events in alphabetical order to the screen
  let indEvents = JSON.parse(localStorage.getItem('indEvents')) || [];
  let teamEvents = JSON.parse(localStorage.getItem('teamEvents')) || [];

  // Sort the individual events by name
  indEvents.sort((a, b) => a.name.localeCompare(b.name));

  // Sort the team events by name
  teamEvents.sort((a, b) => a.name.localeCompare(b.name));

  // Loop through the individual events and add them to the events table
  indEvents.forEach(function(event) {
    // Create a new row for the event
    var newRow = $("<div>").addClass("row");

    // Create the cols div for the event
    var colsDiv = $("<div>").addClass("cols");

    // Create the left column for the event name
    var colLeft = $("<div>").addClass("col-left");
    var eventName = $("<div>").addClass("event-name");
    eventName.append($("<p>").text(event.name));
    colLeft.append(eventName);
    colsDiv.append(colLeft);

    // Create the right column for the start time and edit button
    var colRight = $("<div>").addClass("col-right");
    var startControls = $("<div>").addClass("event-start-controls");
    startControls.append($("<p>").text(event.startTime));
    startControls.append($("<button>").addClass("edit-btn").text("Edit").attr("data-index", event.index));
    colRight.append(startControls);
    colsDiv.append(colRight);

    // Add the cols div to the row
    newRow.append(colsDiv);

    // Add the new row to the individual events table
    $(".events.individual .table-container").append(newRow);
  });

  // Loop through the team events and add them to the events table
  teamEvents.forEach(function(event) {
    // Create a new row for the event
    var newRow = $("<div>").addClass("row");

    // Create the cols div for the event
    var colsDiv = $("<div>").addClass("cols");

    // Create the left column for the event name
    var colLeft = $("<div>").addClass("col-left");
    var eventName = $("<div>").addClass("event-name");
    eventName.append($("<p>").text(event.name));
    colLeft.append(eventName);
    colsDiv.append(colLeft);

    // Create the right column for the start time and edit button
    var colRight = $("<div>").addClass("col-right");
    var startControls = $("<div>").addClass("event-start-controls");
    startControls.append($("<p>").text(event.startTime));
    startControls.append($("<button>").addClass("edit-btn").text("Edit").attr("data-index", event.index));
    colRight.append(startControls);
    colsDiv.append(colRight);

    // Add the cols div to the row
    newRow.append(colsDiv);

    // Add the new row to the team events table
    $(".team .table-container").append(newRow);
  });

  // ~~~ Add Event ~~~
  // add event pop up box
  $(".add-btn").click(function() {
    $(".add-event-popup-container").show();
    eventType = $(this).attr('data-type');
  });
  $(".close-btn").click(function() {
    $(".add-event-popup-container").hide();
  });

  $(".submit-btn").click(function(event) {
    event.preventDefault();

    // Get the event name and start time from the input fields
    var eventName = $("#name").val();
    var startTime = $("#start-time").val();

    // Determine the next index for the new event
    // Get the events from local storage
    let events, eventStorageKey;
    if (eventType === "Team") {
      events = JSON.parse(localStorage.getItem('teamEvents')) || [];
      eventStorageKey = "teamEvents";
    } else {
      events = JSON.parse(localStorage.getItem('indEvents')) || [];
      eventStorageKey = "indEvents";
    }

    // Find the largest index in the events array
    let largestIndex = 0;
    if (events !== null) {
      events.forEach(function(event) {
        if (event.index > largestIndex) {
          largestIndex = event.index;
        }
      });
    }

    // Add 1 to the largest index to get the new index
    var index = largestIndex + 1;

    // Create a new event object
    var newEvent = {
      index: index,
      type: eventType,
      name: eventName,
      startTime: startTime,
      participants: []
    };

    // Push to local storage
    events.push(newEvent)
    localStorage.setItem(eventStorageKey, JSON.stringify(events));
    location.reload();
  });

  // ~~~ Edit Event ~~~
  // Edit button click event handler
  $(document).on("click", ".edit-btn", function() {
    $(".edit-event-popup-container").show();
    // Get the index of the event to edit from the data-index attribute of the clicked button
    editIndex = $(this).attr("data-index");
    console.log(editIndex);
    // Get the event data from local storage
    var eventType = $(this).closest(".events").hasClass("team") ? "Team" : "Individual";
    var events = eventType === "Team" ? JSON.parse(localStorage.getItem('teamEvents')) : JSON.parse(localStorage.getItem('indEvents'));
    var event = events.find(function(item) {
      return item.index === parseInt(editIndex);
    });
    // Set the values of the edit-event-popup fields to the event data
    $(".edit-event-type").text(event.type);
    $(".edit-event-name").val(event.name);
    $(".edit-event-time").val(event.startTime);
  });

  $(".close-btn").click(function() {
    $(".edit-event-popup-container").hide();
  });

  // Confirm button click event handler
  $(".confirm-btn").click(function() {
    // Get the edited event data from the edit-event-popup fields
    var eventName = $(".edit-event-name").val();
    var startTime = $(".edit-event-time").val();
    // Get the events from local storage
    var eventType = $(".edit-event-type").text();
    var events = eventType === "Team" ? JSON.parse(localStorage.getItem('teamEvents')) : JSON.parse(localStorage.getItem('indEvents'));
    // Find the event in the events array with the matching index value
    var eventIndex = events.findIndex(function(item) {
      return item.index === parseInt(editIndex);
    });
    // Update the event data in the events array
    events[eventIndex].name = eventName;
    events[eventIndex].startTime = startTime;
    // Update the events array in local storage
    if (eventType === "Team") {
      localStorage.setItem('teamEvents', JSON.stringify(events));
    } else {
      localStorage.setItem('indEvents', JSON.stringify(events));
    }
    // Reload the page
    location.reload();
  });

  // Delete button click event handler
  $('.delete-btn').click(function() {
    editIndex = parseInt(editIndex); 
    // Get the events from local storage
    var eventType = $(".edit-event-type").text();
    var events = eventType === "Team" ? JSON.parse(localStorage.getItem('teamEvents')) : JSON.parse(localStorage.getItem('indEvents'));
    // Filter the events array to remove the event with the matching index value
    events = events.filter(function(item) {
      return item.index !== editIndex;
    });
    // Update the events array in local storage
    if (eventType === "Team") {
      localStorage.setItem('teamEvents', JSON.stringify(events));
    } else {
      localStorage.setItem('indEvents', JSON.stringify(events));
    }
    // Reload the page
    location.reload();
  });

  $('.cancel-btn').click(function() {
    $('.edit-event-popup-container, .add-event-popup-container').hide()
  })

});