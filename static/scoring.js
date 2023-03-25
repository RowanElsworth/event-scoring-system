$(document).ready(function() {

  var editIndex;

  // load header
  $(function(){
    $("#header").load("/partials/header.html"); 
  });

  let indParticipants = JSON.parse(localStorage.getItem('indParticipants')) || [];
  let teamParticipants = JSON.parse(localStorage.getItem('teamParticipants')) || [];
  
  let indEvents = JSON.parse(localStorage.getItem('indEvents')) || [];
  let teamEvents = JSON.parse(localStorage.getItem('teamEvents')) || [];
  let events = [...indEvents, ...teamEvents].sort((a, b) => a.name.localeCompare(b.name));
  
  $.each(events, function(index, event) {
    var eventTypeClass = event.type === "Team" ? ".team-table-container" : ".ind-table-container";
    var checked = event.scores.length > 0 ? "checked" : "";
    var html = `
      <div class="row">
        <div class="cols">
          <div class="col-left">
            <div class="event-name">
              <p>${event.name}</p>
            </div>
          </div>
          <div class="col-middle">
            <div class="event-start-controls">
              <p>${event.startTime}</p>
            </div>
          </div>
          <div class="col-right">
            <input type="checkbox" name="switch" class="check" disabled ${checked}>
            <button class="scores-btn" data-index="${event.indexID}" data-type="${event.type}">Add/Modify Scores</button>
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
      if (event.indexID == editIndex) {
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
    return result;
  }  

  // gets the participants and pushes into scoring options
  $('.scores-btn').click(function() {
    editType =  $(this).attr('data-type');
    editIndex = parseInt($(this).attr('data-index'));
    // get the participant ids
    info = editType === 'Individual' ? getInfo(indEvents, editIndex) : getInfo(teamEvents, editIndex);
    // sorts in alphbetical order
    participants = info.participants.sort();
    // gets the participants names using the indexes from the function and stores in the variable
    namesIndexesJson = editType === 'Individual' ? getParticipantNames(indParticipants, participants) : getParticipantNames(teamParticipants, participants);
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
        indexID: indexID,
        userName: userName
      };
      scores.push(userObj);
    });

    // check for duplicate entries in scores array
    var duplicates = scores.filter(function(userObj, index) {
      return index !== scores.findIndex(function(otherUserObj) {
        return otherUserObj.userName === userObj.userName;
      });
    });

    if (duplicates.length > 0) {
      // handle error here, for example:
      alert('Error: Duplicate entries found');
      return;
    }

    // chooses between indEvents and teamEvents
    let events = editType === 'Individual' ? indEvents: teamEvents

    console.log('old events:')
    console.log(events)
    // find the event with matching index and update scores array
    var eventFound = false;
    for (var i = 0; i < events.length; i++) {
      if (events[i].indexID === editIndex) {
        console.log(`found and pushed ${scores} to event index: ${editIndex}`);
        events[i].scores = scores;
        eventFound = true;
        break;
      } else {
        console.log(`No event found with index: ${editIndex}`);
      }
    } 
    console.log('new events:')
    console.log(events)

    eventType = editType === 'Individual' ? "ind" : "team"
    // push the updated indEvents list to local storage

    localStorage.setItem(`${eventType}Events`, JSON.stringify(events));

    closePopup();
    calcIndScores();
    calcTeamScores();
    location.reload()
  });

  // Calc scores for each event
  function calcIndScores() {
    // Initialize an object to store the scores for each participant
    let scores = {};

    // Iterate over each event
    for (let event of indEvents) {
      // Iterate over each score in the event
      for (let i = 0; i < event.scores.length; i++) {
        let participantIndexID = event.scores[i].indexID;
        let score = 3 - i; // Assign scores based on position (1st, 2nd, 3rd)

        // Update the score for the participant
        if (participantIndexID in scores) {
          scores[participantIndexID] += score;
        } else {
          scores[participantIndexID] = score;
        }
      }
    }

    // Create an array of objects with the participant name and score
    let leaderboard = [];
    for (let participant of indParticipants) {
      leaderboard.push({
        name: participant.name,
        score: scores[participant.indexID] || 0 // Use 0 as default score if participant did not compete
      });
    }
    localStorage.setItem('indScores', JSON.stringify(leaderboard));
  }

  function calcTeamScores() {
    // Initialize an object to store the scores for each team
    let scores = {};
  
    // Iterate over each event
    for (let event of teamEvents) {
      // Iterate over each score in the event
      for (let i = 0; i < event.scores.length; i++) {
        let teamIndexID = event.indexID;
        let participantIndexID = event.scores[i].indexID;
        let score = 3 - i; // Assign scores based on position (1st, 2nd, 3rd)
  
        // Update the score for the team
        if (teamIndexID in scores) {
          if (participantIndexID in scores[teamIndexID]) {
            scores[teamIndexID][participantIndexID] += score;
          } else {
            scores[teamIndexID][participantIndexID] = score;
          }
        } else {
          scores[teamIndexID] = {};
          scores[teamIndexID][participantIndexID] = score;
        }
      }
    }
  
    // Create an array of objects with the participant name and team score
    let leaderboard = [];
    for (let participant of teamParticipants) {
      let teamScore = 0;
      for (let teamIndexID in scores) {
        if (participant.indexID in scores[teamIndexID]) {
          teamScore += scores[teamIndexID][participant.indexID];
        }
      }
      leaderboard.push({
        name: participant.name,
        score: teamScore
      });
    }
    localStorage.setItem('teamScores', JSON.stringify(leaderboard));
  }  

  // closes pop up
  function closePopup() {
    $('.add-score-popup-container').hide();
    $('#first, #second, #third').empty()
  }

  // closes the popup if open
  $('.cancel-btn, .close-btn').click(function() {
    closePopup()
  })

  // calculates the scores
  calcIndScores();
  calcTeamScores();
});