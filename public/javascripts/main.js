$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $passwordInput = $('.passwordInput'); // Input for password
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  var $profilePage = $('.profile.page'); //The profile page
  var $adminPage = $('.admin.page'); //The admin page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput;
  var instructor = false;
  var student = false;
  var admin = false;
  var tagfilter = 'none';
  var password;
  var socket = io();
  var valid = false;
  let room = '';


  function addParticipantsMessage(data) {
    var message = '';
    if (data.numUsers === 1) {
        message += "there's 1 participant";
    } else {
        message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }
  //open profile page when button is clicked
  function openProfile() {
      $chatPage.hide();
      $adminPage.hide();
      $profilePage.show();
  }

  $('#register').submit(function(event){

      $.post('/register', $(this).serialize(), function(resp){
        if(typeof resp != "string"){
          username = cleanInput($('#username').val().trim());
          valid = true;
          $loginPage.fadeOut();
          $chatPage.show();
          $loginPage.off('click');

          socket.emit('add user', username);
	  student = true;
          userSetUp(resp);

        }else{
          valid = false;
          alert("Registration failed");
        }
      });

        event.preventDefault();
        return false;
        
  });
  function adminTable(data){
	document.getElementById("userlistdisplay").innerHTML = "";
	document.getElementById("adminmessage").innerText = "";
	let tableparent = $('#userlistdisplay');
	let tmp = $('<tr>');
	tmp.append($('<th>').text('Username'));
	tmp.append($('<th>').text('Student Number'));
	tmp.append($('<th>').text('E-mail'));
	tmp.append($('<th>').text('Given Name'));
	tmp.append($('<th>').text('Family Name'));
	tmp.append($('<th>').text('Status'));
	tmp.append($('<th>').text('Year'));
	tmp.append($('<th>').text('Role'));
	tableparent.append(tmp);
	for (let i = 0; i < data.length; i++){
		tmp = $('<tr>');
		tmp.append($('<td>').text(data[i].username));
		tmp.append($('<td>').text(data[i].studentnum));
		tmp.append($('<td>').text(data[i].email));
		tmp.append($('<td>').text(data[i].givenname));
		tmp.append($('<td>').text(data[i].lastname));
		tmp.append($('<td>').text(data[i].status));
		tmp.append($('<td>').text(data[i].year));
		tmp.append($('<td>').text(data[i].role));
		tableparent.append(tmp);
	}
  }

  function adminSetUp(){
	let adminparent = $('#adminlink');
	let adminbuttonclear = document.getElementById('adminlink');
	adminbuttonclear.innerHTML = '';
	let tmp = $('<button>').text('Admin Page');
	tmp.on('click', function (){
		$chatPage.hide();
		$profilePage.hide();
		$adminPage.show();
	});
	adminparent.append(tmp);
	adminFunction();
  }

  function adminFunction(){
	$("#getinfobyuser").on('click', function(){
		let username = document.getElementById("getusernameinput").value;
		 $.get('/get_student', { username: username }, function(resp_data){
				console.log(resp_data);
				adminTable(resp_data);
			});
	});
	$("#getinfobynum").on('click', function(){
		let stunum = document.getElementById("getusernuminput").value;
		 $.get('/get_student', { studentnumber: stunum }, function(resp_data){
				console.log(resp_data);
				adminTable(resp_data);
			});
	});
	$("#changerolesave").on('click', function(){
		let userrole = document.getElementById("userroledrop").value;
		let username = document.getElementById("changeroleusername").value;
		console.log(username);
		$.post('/update_student', { username: username, role: userrole}, function(resp_data){
					document.getElementById("userlistdisplay").innerHTML = "";
					document.getElementById("adminmessage").innerText = "User Role Changed";
					console.log(resp_data);
			});
	});
	$("#deleteuserbyuser").on('click', function(){
		let username = document.getElementById("deleteusernameinput").value;
		console.log(username);
		$.post('/remove_student', { username: username }, function(resp_data){
					document.getElementById("userlistdisplay").innerHTML = "";
					document.getElementById("adminmessage").innerText = "User Removed";
			});
	});
  }

  function userSetUp(user){
      	let profparent = $('#profilelink');
	let profilebuttonclear = document.getElementById('profilelink');
	profilebuttonclear.innerHTML = '';
      	let tmp = $('<button>').text('Profile Page');
      	tmp.on('click', function () {
	   openProfile();
	   profilePage(user);
      	});
      	profparent.append(tmp);
      	createCourseList(user);
	if (student){
		studentProfileFields(user);
	}
      	addHandlers();
  }

  function studentProfileFields(user){
		document.getElementById('changestudentnumber').innerHTML = "";
		document.getElementById('changeyear').innerHTML = "";
		document.getElementById('changestatus').innerHTML = "";
		let studentnumparent = $('#changestudentnumber');
		tmp = $('<h3>').text("Change Student Number");
		studentnumparent.append(tmp);
		tmp = $('<input>');
		tmp.attr('id','changestudentnum');
		tmp.attr('type', 'number');
		studentnumparent.append(tmp);
		let yearparent = $('#changeyear');
		tmp = $('<h3>').text("Change Year");
		yearparent.append(tmp);
		tmp = $('<input>');
		tmp.attr('id','changeyearinput');
		tmp.attr('type', 'number');
		yearparent.append(tmp);
		let statusparent = $('#changestatus');
		tmp = $('<h3>').text("Change Status");
		statusparent.append(tmp);
		tmp = $('<select>');
		tmp.attr('id','statusinput');
		let statuslist = ["Undergrad","MsC","PhD","MScAC","MEng"];
		for (let i = 0; i < statuslist.length; i++){
			let tmpopt = $('<option>').text(statuslist[i]);
			tmpopt.attr('value',statuslist[i]);
			console.log(user.status);
			console.log(statuslist[i]);
			if (user.status == statuslist[i]){
				tmpopt.attr('selected','selected');
			}
			tmp.append(tmpopt);
		}
		statusparent.append(tmp);
  }
  function profilePage(user){
	document.getElementById("profilemessage").innerText = "";
	let username = user.username;
        let userparent = $('#usernamedisplay');
	let userclear = document.getElementById("usernamedisplay");
	userclear.innerHTML = '';
        let tmp = $('<h4>').text(username);
	userparent.append(tmp);
	let courses = user.courses.slice(0);
	console.log(user.courses);
	userparent = $('#usercoursesdisplay');
	userclear = document.getElementById("usercoursesdisplay");
	userclear.innerHTML = '';
	for (let i = 0; i < courses.length; i++){
		let tmp = $('<div>')
		tmp.attr('id', 'profilediv'+courses[i]);
		let tmplab = $('<label>').text(courses[i] + "  ");
		tmplab.attr('for', 'button'+courses[i]);
		tmplab.attr('value', courses[i]);
		tmplab.attr('id', 'label'+courses[i]);
		tmp.append(tmplab)
		let tmpbut = $('<input>');
		tmpbut.attr('type', 'submit');
		tmpbut.attr('value', 'Remove');
		tmpbut.attr('id', 'button'+courses[i]);
		let coursename = courses[i];
		tmpbut.on('click', function (){
			let rmelement = document.getElementById("profilediv"+coursename);
			rmelement.innerHTML = '';
			courses.splice(courses.indexOf(coursename),1);
			console.log(courses);
			//console.log(rmelement);
			//console.log(user.courses);
		});
		tmp.append(tmpbut);
		userparent.append(tmp);
	}
	let usercoursetoaddbutton = $('#addcoursebutton');
	usercoursetoaddbutton.on('click', function(){
		let usercoursetoadd = $('#addcourse').val();
		console.log(usercoursetoadd);
		console.log(courses.indexOf(usercoursetoadd));
		if (!(courses.indexOf(usercoursetoadd) > -1) && usercoursetoadd != ""){
			let tmp = $('<div>')
			tmp.attr('id', 'profilediv'+usercoursetoadd);
			let tmplab = $('<label>').text(usercoursetoadd + "  ");
			tmplab.attr('for', 'button'+usercoursetoadd);
			tmplab.attr('value', usercoursetoadd);
			tmplab.attr('id', 'label'+usercoursetoadd);
			tmp.append(tmplab)
			let tmpbut = $('<input>');
			tmpbut.attr('type', 'submit');
			tmpbut.attr('value', 'Remove');
			tmpbut.attr('id', 'button'+usercoursetoadd);
			courses.push(usercoursetoadd);
			console.log(courses);
			console.log(user.courses);
			tmpbut.on('click', function (){
				let rmelement = document.getElementById("profilediv"+usercoursetoadd);
				rmelement.innerHTML = '';
				courses.splice(courses.indexOf(usercoursetoadd),1);
				//console.log(courses);
				//console.log(rmelement);
				//console.log(user.courses);
			});
			tmp.append(tmpbut);
			userparent.append(tmp);
		}
		document.getElementById("addcourse").value = "";
	});
	document.getElementById("changepasswordinput").value = "";
	document.getElementById("confirmchangepasswordinput").value = "";
	document.getElementById("emailInput").value = user.email;
	document.getElementById("givennameInput").value = user.givenname;
	document.getElementById("lastnameInput").value = user.lastname;
	if (student){
		document.getElementById("changestudentnum").value = user.studentnum;
		document.getElementById("changeyearinput").value = user.year;
	}
	$("#save").on('click', function(){
		let changeemail = document.getElementById("emailInput").value
		if (changeemail.length == 0){
			changeemail = user.email;
		}
		let changepass = document.getElementById("changepasswordinput").value;
		let confirmpass = document.getElementById("confirmchangepasswordinput").value;
		console.log(changepass.length);
		console.log(confirmpass.length);
		let nopass = false;
		if (changepass.length == 0 && confirmpass.length == 0){
			changepass = user.password;
			nopass = true;
		}
		let changegivenname = document.getElementById("givennameInput").value;
		if (changegivenname.length == 0){
			changegivenname = user.givenname;
		}
		let changelastname = document.getElementById("lastnameInput").value;
		if (changelastname.length == 0){
			changelastname = user.lastname;
		}
		let changestudentnum = user.studentnum;
		let changeyear = user.year;
		let changestatus = user.status;
		if(student){
			changestudentnum = document.getElementById("changestudentnum").value;
			if (changestudentnum.length == 0){
				changestudentnum = user.studentnum;
			}
			changeyear = document.getElementById("changeyearinput").value;
			if (changeyear.length == 0){
				changeyear = user.year;
			}
			changestatus = document.getElementById("statusinput").value;
			if (changestatus.length == 0){
				changestatus = user.status;
			}
		}
		console.log(courses);
		console.log(user.courses);
		console.log(username);
		if (nopass || (changepass == confirmpass)){
			$.post('/update_student', { username: username, password: changepass,  email: changeemail, studentnum: changestudentnum, courses: courses, givenname: changegivenname, lastname: changelastname, year: changeyear, status: changestatus}, function(resp_data){
					console.log(resp_data);
					document.getElementById("profilemessage").innerText = "Profile Information Saved";
					document.getElementById("changepasswordinput").value = "";
					document.getElementById("confirmchangepasswordinput").value = "";
					userSetUp(resp_data);
			});
		}
		else{
			document.getElementById("profilemessage").innerText = "Please make sure your password fields match";
		}
	});
  }

  function createCourseList(user){
	let usercourses = user.courses
	let courseparent = $('#class-list');
	let courseclear = document.getElementById('class-list');
	courseclear.innerHTML = '';
	for (let i = 0; i < usercourses.length; i++){
		let tmp = $('<li>').text(usercourses[i]);
		tmp.attr('id', usercourses[i]);
		courseparent.append(tmp);
        }
  }

  //creates a filter for tags (only instructors can see this)
  function createTagFilter () {
	let tags = ['none','no tag', 'question', 'suggestion'];
        console.log("Instructor is true drop down entered");
    	let parenttag = $('#tag-drop');
	parenttag.append($('<h5>').text("Filter by Tag"));
	let tmp = $('<select>');
	tmp.attr('id', 'tagfil');
	for (let i = 0; i < tags.length; i++){
		let tmpopt = $('<option>').text(tags[i]);
		tmpopt.attr('id', 'tagdrop'+i);
		tmp.append(tmpopt);
	}
	parenttag.append(tmp);
	$('#tagfil').change(function () {
		console.log('drop change');
		tagfilter = this.value.replace(/\s/, '');
		console.log('tag filter: '+tagfilter);
		clearMessages();
		var message = "Welcome to " + room + "\'s Chat!";
		log(message, {
		  prepend: true
		});
		$.get('/get_messages', { course: room, tag: tagfilter }, function(resp_data){
		  for(let x = 0; x < resp_data.length; x++){
		    addChatMessage({
		      username: resp_data[x]["username"],
		      message: resp_data[x]["content"],
		      tag: resp_data[x]["tag"]
		    });
		  }

		});
	});
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    var tag = document.getElementById("tag-select").value;
    console.log(tag);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message,
	tag: tag
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);

      /*
       *  Save the new message to the database
       */
      var messages = {};
      messages['username'] = username;
      messages['content'] = message;
      messages['course'] = room;
      messages['tag'] = tag; 

      $.post('/add_messages', messages, function(resp){
        console.log(resp);
      });

    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  //Clear all the messages
  function clearMessages(){
    $('.messages')[0].innerHTML = '';
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);
    if (data.tag != "notag" && data.tag != "0" && instructor){
        var $tagDiv = $('<span class="tagBody">')
          .text("  " + data.tag)
          .css('color', 'aqua');
    }
    else{
	var $tagDiv = $('<span class="tagBody">')
    }
    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv, $tagDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    //if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      //$currentInput.focus();
    //}
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (valid) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {

        $.post('/validateUser', $("#login-form").serialize(), function(resp_data) {
        
          if(typeof resp_data === "string"){
            alert(resp_data);
            valid = false;
          }else{
            console.log(resp_data);
            username = cleanInput(resp_data[0].username.trim());
            valid = true;
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            //$currentInput = $inputMessage.focus();
            // Tell the server your username
            socket.emit('add user', username);
	    if(resp_data[0].role == "admin"){
			admin = true;
			adminSetUp();
			createTagFilter();
	    }
            else if (resp_data[0].role == "instructor"){
			instructor = true;
			createTagFilter();
	    }
	    else{
			student = true;
            }
            userSetUp(resp_data[0]);
            //check if user is an instructor

          }

       });

      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  //$loginPage.click(function () {
    //$currentInput.focus();
  //});

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {   
    log(data.username + ' joined');
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  /*
   *
   *  Set the onclick handlers for all the students classes.
   *  Used to broadcast to a specific socket
   *
   */
  function addHandlers(){
    
    let children = $('#class-list')[0].children;

    for(let x = 0; x < children.length; x++){

      $('#' + children[x].id).on('click', function(){
	$profilePage.hide();
	$adminPage.hide();
	$chatPage.show();
        socket.emit('leave-room', room);
        room = children[x].innerText;
        socket.emit('join-room', room);
        clearMessages();
        var message = "Welcome to " + room + "\'s Chat!";
        log(message, {
          prepend: true
        });
        $.get('/get_messages', { course: room, tag: tagfilter }, function(resp_data){
          for(let x = 0; x < resp_data.length; x++){
            addChatMessage({
              username: resp_data[x]["username"],
              message: resp_data[x]["content"],
	      tag: resp_data[x]["tag"]
            });
          }

        });

      });

    }

  }



});
