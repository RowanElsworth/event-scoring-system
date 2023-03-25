$(document).ready(function() {

  // authentication check
  // if (localStorage.getItem('user')) {
  //   window.location.href = '/pages/schedule/schedule.html'; // redirect to schedule page
  // }

  // handles form submission and authentication
  $('form').submit(function(event) {
    event.preventDefault(); // prevent form submission
    
    // gets user input
    var username = $('input[name="username"]').val();
    var password = $('input[name="password"]').val();
    
    // send AJAX request to get the list of users
    $.getJSON('../../users.json', function(data) {
      var userFound = false;
      $.each(data.users, function(index, user) {
        if (user.username === username && user.password === password) {
          userFound = true;
          // store user information in local storage
          localStorage.setItem('user', JSON.stringify(user));
          window.location.href = '/pages/schedule/schedule.html'; // redirect to schedule page
          return false; // exit the loop early
        }
      });
      if (!userFound) {
        alert('Username or password is incorrect');
      }
    });
  });
});
