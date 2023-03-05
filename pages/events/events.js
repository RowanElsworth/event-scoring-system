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
  let events = JSON.parse(localStorage.getItem('events'))
  // Sort the events by name
  events.sort((a, b) => a.name.localeCompare(b.name));

  // Loop through the events and add them to the events table
  events.forEach(function(event) {
    // Determine the type of the event (team or individual)
    var eventTypeClass = event.type === "Team" ? "team" : "individual";
  
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
  
    // Add the new row to the events table
    $(".events." + eventTypeClass + " .table-container").append(newRow);
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
    var events = JSON.parse(localStorage.getItem('events'));
    var index = events.length + 1;

    // Create a new event object
    var newEvent = {
      index: index,
      type: eventType,
      name: eventName,
      startTime: startTime,
      participants: []
    };
    console.log(newEvent)

    // Push to local storage
    if (localStorage.getItem('events') == undefined) {
      localStorage.setItem('events', "[]");
      events.push(newEvent)
      localStorage.setItem('events', JSON.stringify(events));
      location.reload();
    } else {
      events.push(newEvent)
      localStorage.setItem('events', JSON.stringify(events));
      location.reload();
    }
  });

  // ~~~ Edit Event ~~~
  // Edit button click event handler
  $(".edit-btn").click(function() {
    $(".edit-event-popup-container").show();
    // Get the index of the event to edit from the data-index attribute of the clicked button
    editIndex = $(this).attr("data-index");
    console.log(editIndex);
    // Get the event data from local storage
    var events = JSON.parse(localStorage.getItem('events'));
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
    var events = JSON.parse(localStorage.getItem('events'));
    // Find the event in the events array with the matching index value
    var eventIndex = events.findIndex(function(item) {
      return item.index === parseInt(editIndex);
    });
    // Update the event data in the events array
    events[eventIndex].name = eventName;
    events[eventIndex].startTime = startTime;
    // Update the events array in local storage
    localStorage.setItem('events', JSON.stringify(events));
    // Hide the edit-event-popup
    $(".edit-event-popup-container").hide();
    // Reload the page
    location.reload();
  });
  
  // Delete button click event handler
  $(".delete-btn").click(function() {
    editIndex = parseInt(editIndex); 
    // Get the events from local storage
    var events = JSON.parse(localStorage.getItem('events'));
    // Filter the events array to remove the event with the matching index value
    events = events.filter(function(item) {
      return item.index !== editIndex;
    });
    // Update the events array in local storage
    localStorage.setItem('events', JSON.stringify(events));
    // Hide the edit-event-popup
    $(".edit-event-popup-container").hide();
    // Reload the page
    location.reload();
  });

});