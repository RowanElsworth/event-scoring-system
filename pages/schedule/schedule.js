$(document).ready(function() {

  // load header
  $(function(){
    $("#header").load("../../partials/header.html"); 
  });
  
  // authentication check
  if (!localStorage.getItem('user')) {
    // redirect to login page if not authenticated
    window.location.href = '/pages/auth/auth.html';
  }
  

  
  // updates next event
  $.getJSON('../../events.json', function(data) {
    var sortedEvents = data.events.sort(function(a, b) {
      var timeA = new Date('1970/01/01 ' + a.startTime);
      var timeB = new Date('1970/01/01 ' + b.startTime);
      return timeA - timeB;
    });
    var soonestEvent = sortedEvents[0];
    
    var output = {
      "type": soonestEvent.type,
      "name": soonestEvent.name,
      "startTime": soonestEvent.startTime,
      "participants": soonestEvent.participants
    };
    console.log(output);
  });
  


  

  $.getJSON("../../events.json", function(data) {
    var events = data.events.concat(data.indEvents);
    events.sort(function(a, b) {
      return new Date("1970/01/01 " + a.startTime) - new Date("1970/01/01 " + b.startTime);
    });
    $.each(events, function(index, event) {
      var html = `<p>${event.type} <span>${event.name}</span><span>${event.startTime} <a href="">View</a></span></p>`;
      $(".upcoming-events-list").append(html);
    });
  });
  
});
  
