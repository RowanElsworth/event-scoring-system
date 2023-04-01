$(document).ready(function() {

  // load header
  $(function(){
    $("#header").load("/partials/header.html"); 
  });
  
  // Calc scores for each event
  function calcIndScores() {
    indEvents = JSON.parse(localStorage.getItem("indEvents")) || [];
    indParticipants = JSON.parse(localStorage.getItem("indParticipants")) || [];
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
    teamEvents = JSON.parse(localStorage.getItem("teamEvents")) || [];
    teamParticipants = JSON.parse(localStorage.getItem("teamParticipants")) || [];
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

  calcIndScores()
  calcTeamScores()

  var indScores = JSON.parse(localStorage.getItem('indScores'));
  var scoresList = $('.ind-scores-list');
  
  indScores.sort(function(a, b) {
    return b.score - a.score;
  });
  
  $.each(indScores, function(index, item) {
    var score = $('<div><p>' + item.name + '</p><p>' + item.score + '</p></div>');
    scoresList.append(score);
  });
  
  var teamScores = JSON.parse(localStorage.getItem('teamScores'));
  var scoresList = $('.team-scores-list');

  teamScores.sort(function(a, b) {
    return b.score - a.score;
  });
  
  $.each(teamScores, function(index, item) {
    var score = $('<div><p>' + item.name + '</p><p>' + item.score + '</p></div>');
    scoresList.append(score);
  });

});