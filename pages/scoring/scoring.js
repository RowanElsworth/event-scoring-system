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

  let indParticipants = JSON.parse(localStorage.getItem('indParticipants')) || [];
  let teamParticipants = JSON.parse(localStorage.getItem('teamParticipants')) || [];
  
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
              <button class="scores-btn" data-index="${event.index}" data-type="${event.type}">Add/Modify Scores</button>
            </div>
          </div>
        </div>
      </div>
    `;
    $(eventTypeClass).append(html);
  });
    
  // gets the event from the buttons clicked and the participants
  function getInfo(events, editIndex) {
    var result = null;
    // gets the event from the event.index
    $.each(events, function(index, event) {
      if (event.index == editIndex) {
        result = event;
        return false;
      }
    });
    return result;
  }

  // gets the participants names from the indexes in the events.participants
  function getParticipantNames(participants, indexList) {
    var result = $.map(indexList, function(index) {
      var participant = getInfo(participants, index);
      if (participant) {
        return {
          index: index,
          userName: participant.name
        };
      }
    });
    console.log(result)
    return result;
  }  

  // gets the participants and pushes into scoring options
  $('.scores-btn').click(function() {
    editType =  $(this).attr('data-type');
    editIndex = parseInt($(this).attr('data-index'));

    
    // get the participant ids
    info = editType === 'Individual' ? getInfo(indEvents, editIndex) : getInfo(teamEvents, editIndex);

    participants = info.participants.sort();
    namesIndexesJson = getParticipantNames(indParticipants, participants);
    
    var selectElement = $('#first, #second, #third');
    
    // push the array to the score select option thingy
    $.each(namesIndexesJson, function(index, value) {
      var optionElement = $('<option>').attr('value', value.userName).text(value.userName).attr('index', value.index);
      selectElement.append(optionElement);
    });
    

    $('.add-score-popup-container').show()
  });

  // submit the scores
  $('.submit-btn').click(function() {
    editIndex = parseInt(editIndex);
    var scores = [];
    $('.add-score-popup select').each(function() {
      var userName = $(this).val();
      var indexID = $(this).children('option:selected').attr('index');
      var userObj = {
        index: indexID,
        userName: userName
      };
      scores.push(userObj);
    });
    console.log(scores);

    // find the event with matching index and update scores array
    var eventFound = false;
    for (var i = 0; i < indEvents.length; i++) {
      if (indEvents[i].index === editIndex) {
        console.log(`found and pushed ${scores} to event index: ${editIndex}`);
        console.log(indEvents[i].scores);
        indEvents[i].scores = scores;
        console.log(indEvents[i].scores);
        eventFound = true;
        break;
      }
    }

    if (!eventFound) {
      console.log(`No event found with index: ${editIndex}`);
    }

    // push the updated indEvents list to local storage
    localStorage.setItem('indEvents', JSON.stringify(indEvents));

    closePopup();
  });

  // Calc scores for each event
  // Create an empty array to store all the event scores
  var allEventScores = [];

  // Loop through the events in the indEvents array
  $.each(indEvents, function(index, event) {
      // Check if the event has any scores
      if (event.scores.length > 0) {
          // Create an empty array to store the calculated scores
          var eventScores = [];
          
          // Loop through the participants in the event
          $.each(event.participants, function(index, participantIndex) {
              // Find the participant's score in the event's scores array
              var participantScore = event.scores.find(function(score) {
                  return score.index == participantIndex.toString();
              });
              
              // If the participant has a score, add the corresponding points to their score
              if (participantScore) {
                  var points = 0;
                  if (event.scores.indexOf(participantScore) == 0) {
                      points = 3;
                  } else if (event.scores.indexOf(participantScore) == 1) {
                      points = 2;
                  } else if (event.scores.indexOf(participantScore) == 2) {
                      points = 1;
                  }
                  
                  eventScores.push({
                      userName: participantScore.userName,
                      score: points
                  });
              }
          });
          
          // Push the calculated scores for the event into the overall array
          allEventScores.push({
              eventName: event.name,
              eventScores: eventScores
          });
          
          // Log the calculated scores for the event
          console.log(event.name + ': ' + JSON.stringify(eventScores));
          // todo: sort the scores in descending order
      }
  });

// Log the overall array of event scores
console.log(JSON.stringify(allEventScores));
localStorage.setItem('eventScores', JSON.stringify(allEventScores))



  // closes pop up
  function closePopup() {
    $('.add-score-popup-container').hide();
    $('#first, #second, #third').empty()
  }

  // closes the popup if open
  $('.cancel-btn, .close-btn').click(function() {
    closePopup()
  })

  
});


// add the scores into a seperate array in the teams scores=[]
// make this code use that array for scoring, and put it into a new local storage key 
