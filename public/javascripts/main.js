$(function() {

    var chatRoomApp = chatRoomApp || {};

    chatRoomApp.FADE_TIME = 150;

    // Initialize variables
    chatRoomApp.$window = $(window);
    chatRoomApp.$messages = $('.messages'); // Messages area
    chatRoomApp.$inputMessage = $('.inputMessage'); // Input message input box
    chatRoomApp.$loginPage = $('.login.page'); // The login page
    chatRoomApp.$chatPage = $('.chat.page'); // The chatroom page
    chatRoomApp.$profilePage = $('.profile.page'); //The profile page
    chatRoomApp.$adminPage = $('.admin.page'); //The admin page
    chatRoomApp.username = "";
    chatRoomApp.connected = false;
    chatRoomApp.instructor = false;
    chatRoomApp.student = false;
    chatRoomApp.admin = false;
    chatRoomApp.tagfilter = 'none';
    chatRoomApp.socket = io();
    chatRoomApp.valid = false;
    chatRoomApp.room = '';

    //open profile page when button is clicked
    chatRoomApp.openProfile = function() {
        chatRoomApp.$chatPage.hide();
        chatRoomApp.$adminPage.hide();
        chatRoomApp.$profilePage.show();
    };

    chatRoomApp.adminTable = function(data) {
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
        for (let i = 0; i < data.length; i++) {
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
    };

    chatRoomApp.adminSetUp = function() {
        let adminparent = $('#adminlink');
        let adminbuttonclear = document.getElementById('adminlink');
        adminbuttonclear.innerHTML = '';
        let tmp = $('<button>').text('Admin Page');
        tmp.on('click', function() {
            chatRoomApp.$chatPage.hide();
            chatRoomApp.$profilePage.hide();
            chatRoomApp.$adminPage.show();
        });
        adminparent.append(tmp);
        chatRoomApp.adminFunction();
    };

    chatRoomApp.adminFunction = function() {

        $("#getalluser").on('click', function() {
            $.get('/get_student', {}, function(resp_data) {
                console.log(resp_data);
                chatRoomApp.adminTable(resp_data);
            });
        });

        $("#getinfobyuser").on('click', function() {
            let username = document.getElementById("getusernameinput").value;
            $.get('/get_student', {
                username: username
            }, function(resp_data) {
                console.log(resp_data);
                chatRoomApp.adminTable(resp_data);
            });
        });

        $("#getinfobynum").on('click', function() {
            let stunum = document.getElementById("getusernuminput").value;
            $.get('/get_student', {
                studentnumber: stunum
            }, function(resp_data) {
                chatRoomApp.adminTable(resp_data);
            });
        });

        $("#changerolesave").on('click', function() {
            let userrole = document.getElementById("userroledrop").value;
            let username = document.getElementById("changeroleusername").value;
            $.post('/update_student', {
                username: username,
                role: userrole
            }, function(resp_data) {
                document.getElementById("userlistdisplay").innerHTML = "";
                document.getElementById("adminmessage").innerText = "User Role Changed";
            });
        });

        $("#deleteuserbyuser").on('click', function() {
            let username = document.getElementById("deleteusernameinput").value;
            $.post('/remove_student', {
                username: username
            }, function(resp_data) {
                document.getElementById("userlistdisplay").innerHTML = "";
                document.getElementById("adminmessage").innerText = "User Removed";
            });
        });

    };

    chatRoomApp.userSetUp = function(user) {
        let profparent = $('#profilelink');
        let profilebuttonclear = document.getElementById('profilelink');
        profilebuttonclear.innerHTML = '';
        let tmp = $('<button>').text('Profile Page');
        tmp.on('click', function() {
            chatRoomApp.openProfile();
            chatRoomApp.profilePage(user);
        });
        $("#classtitle").show();
        profparent.append(tmp);
        chatRoomApp.createCourseList(user);
        if (chatRoomApp.student) {
            chatRoomApp.studentProfileFields(user);
        }
        chatRoomApp.addHandlers();
    };

    chatRoomApp.studentProfileFields = function(user) {
        document.getElementById('changestudentnumber').innerHTML = "";
        document.getElementById('changeyear').innerHTML = "";
        document.getElementById('changestatus').innerHTML = "";
        let studentnumparent = $('#changestudentnumber');
        tmp = $('<input>');
        tmp.attr('id', 'changestudentnum');
        tmp.attr('type', 'number');
        tmp.attr('class', 'form-control');
        studentnumparent.append(tmp);
        let yearparent = $('#changeyear');
        tmp = $('<input>');
        tmp.attr('id', 'changeyearinput');
        tmp.attr('type', 'number');
        tmp.attr('class', 'form-control');
        yearparent.append(tmp);
        let statusparent = $('#changestatus');
        tmp = $('<select>');
        tmp.attr('id', 'statusinput');
        tmp.attr('class', 'form-control');
        let statuslist = ["Undergrad", "MsC", "PhD", "MScAC", "MEng"];
        for (let i = 0; i < statuslist.length; i++) {
            let tmpopt = $('<option>').text(statuslist[i]);
            tmpopt.attr('value', statuslist[i]);
            console.log(user.status);
            console.log(statuslist[i]);
            if (user.status == statuslist[i]) {
                tmpopt.attr('selected', 'selected');
            }
            tmp.append(tmpopt);
        }
        statusparent.append(tmp);
    };

    chatRoomApp.profilePage = function(user) {
        document.getElementById("profilemessage").innerText = "";
        let username = user.username;
        let userparent = $('#usernamedisplay');
        let userclear = document.getElementById("usernamedisplay");
        userclear.innerHTML = '';
        let tmp = $('<h4>').text(username);
        userparent.append(tmp);
        let courses = user.courses.slice(0);
        userparent = $('#usercoursesdisplay');
        userclear = document.getElementById("usercoursesdisplay");
        userclear.innerHTML = '';
        for (let i = 0; i < courses.length; i++) {
            let tmp = $('<div>')
            tmp.attr('id', 'profilediv' + courses[i]);
            let tmplab = $('<label>').text(courses[i] + "  ");
            tmplab.attr('for', 'button' + courses[i]);
            tmplab.attr('value', courses[i]);
            tmplab.attr('id', 'label' + courses[i]);
            tmplab.attr('style', 'margin-right:2%;');
            tmp.append(tmplab)
            let tmpbut = $('<input>');
            tmpbut.attr('type', 'submit');
            tmpbut.attr('value', 'Remove');
            tmpbut.attr('id', 'button' + courses[i]);
            let coursename = courses[i];
            tmpbut.on('click', function() {
                let rmelement = document.getElementById("profilediv" + coursename);
                rmelement.innerHTML = '';
                courses.splice(courses.indexOf(coursename), 1);
            });
            tmp.append(tmpbut);
            userparent.append(tmp);
        }
        let usercoursetoaddbutton = $('#addcoursebutton');
        usercoursetoaddbutton.on('click', function() {
            let usercoursetoadd = $('#addcourse').val();
            console.log(usercoursetoadd);
            console.log(courses.indexOf(usercoursetoadd));
            if (!(courses.indexOf(usercoursetoadd) > -1) && usercoursetoadd != "") {
                let tmp = $('<div>')
                tmp.attr('id', 'profilediv' + usercoursetoadd);
                let tmplab = $('<label>').text(usercoursetoadd + "  ");
                tmplab.attr('for', 'button' + usercoursetoadd);
                tmplab.attr('value', usercoursetoadd);
                tmplab.attr('id', 'label' + usercoursetoadd);
                tmp.append(tmplab)
                let tmpbut = $('<input>');
                tmpbut.attr('type', 'submit');
                tmpbut.attr('value', 'Remove');
                tmpbut.attr('id', 'button' + usercoursetoadd);
                courses.push(usercoursetoadd);
                tmpbut.on('click', function() {
                    let rmelement = document.getElementById("profilediv" + usercoursetoadd);
                    rmelement.innerHTML = '';
                    courses.splice(courses.indexOf(usercoursetoadd), 1);
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
        
        if (chatRoomApp.student) {
            document.getElementById("changestudentnum").value = user.studentnum;
            document.getElementById("changeyearinput").value = user.year;
        }else{
           $('#changestudentnumber').parent().parent().remove();
           $('#changestatus').parent().parent().remove();
           $('#changeyear').parent().parent().remove();
        }

        $("#save").on('click', function() {
            let changeemail = document.getElementById("emailInput").value
            if (changeemail.length == 0) {
                changeemail = user.email;
            }
            let changepass = document.getElementById("changepasswordinput").value;
            let confirmpass = document.getElementById("confirmchangepasswordinput").value;
            console.log(changepass.length);
            console.log(confirmpass.length);
            let nopass = false;
            if (changepass.length == 0 && confirmpass.length == 0) {
                changepass = user.password;
                nopass = true;
            }
            let changegivenname = document.getElementById("givennameInput").value;
            if (changegivenname.length == 0) {
                changegivenname = user.givenname;
            }
            let changelastname = document.getElementById("lastnameInput").value;
            if (changelastname.length == 0) {
                changelastname = user.lastname;
            }
            let changestudentnum = user.studentnum;
            let changeyear = user.year;
            let changestatus = user.status;
            if (chatRoomApp.student) {
                changestudentnum = document.getElementById("changestudentnum").value;
                if (changestudentnum.length == 0) {
                    changestudentnum = user.studentnum;
                }
                changeyear = document.getElementById("changeyearinput").value;
                if (changeyear.length == 0) {
                    changeyear = user.year;
                }
                changestatus = document.getElementById("statusinput").value;
                if (changestatus.length == 0) {
                    changestatus = user.status;
                }
            }

            if (nopass || (changepass == confirmpass)) {
                $.post('/update_student', {
                    username: username,
                    password: changepass,
                    email: changeemail,
                    studentnum: changestudentnum,
                    courses: courses,
                    givenname: changegivenname,
                    lastname: changelastname,
                    year: changeyear,
                    status: changestatus
                }, function(resp_data) {
                    console.log(resp_data);
                    document.getElementById("profilemessage").innerText = "Profile Information Saved";
                    document.getElementById("changepasswordinput").value = "";
                    document.getElementById("confirmchangepasswordinput").value = "";
                    chatRoomApp.userSetUp(resp_data);
                });
            } else {
                document.getElementById("profilemessage").innerText = "Please make sure your password fields match";
            }
        });

    }

    chatRoomApp.createCourseList = function(user) {
        let usercourses = user.courses
        let courseparent = $('#class-list');
        let courseclear = document.getElementById('class-list');
        courseclear.innerHTML = '';
        for (let i = 0; i < usercourses.length; i++) {
            let tmp = $('<li>').text(usercourses[i]);
            tmp.attr('id', usercourses[i]);
            courseparent.append(tmp);
        }
    }

    //creates a filter for tags (only instructors can see chatRoomApp)
    chatRoomApp.createTagFilter = function() {
        let tags = ['none', 'no tag', 'question', 'suggestion'];
        console.log("Instructor is true drop down entered");
        let parenttag = $('#tag-drop');
        parenttag.append($('<h5>').text("Filter by Tag"));
        let tmp = $('<select>');
        tmp.attr('id', 'tagfil');
        for (let i = 0; i < tags.length; i++) {
            let tmpopt = $('<option>').text(tags[i]);
            tmpopt.attr('id', 'tagdrop' + i);
            tmp.append(tmpopt);
        }
        parenttag.append(tmp);
        $('#tagfil').change(function() {
            console.log('drop change');
            tagfilter = this.value.replace(/\s/, '');
            console.log('tag filter: ' + tagfilter);
            chatRoomApp.clearMessages();
            var message = "Welcome to " + chatRoomApp.room + "\'s Chat!";
            chatRoomApp.log(message, { prepend: true});
            $.get('/get_messages', {
                course: chatRoomApp.room,
                tag: chatRoomApp.tagfilter
            }, function(resp_data) {
                for (let x = 0; x < resp_data.length; x++) {
                    chatRoomApp.addChatMessage({
                        username: resp_data[x]["username"],
                        message: resp_data[x]["content"],
                        tag: resp_data[x]["tag"]
                    });
                }

            });
        });
    }

    // Sends a chat message
    chatRoomApp.sendMessage = function() {
        var message = chatRoomApp.$inputMessage.val();
        // Prevent markup from being injected into the message
        message = chatRoomApp.cleanInput(message);
        var tag = document.getElementById("tag-select").value;

        if (message) {
            chatRoomApp.$inputMessage.val('');

            chatRoomApp.addChatMessage({
                username: chatRoomApp.username,
                message: message,
                tag: tag
            });

            // tell server to execute 'new message' and send along one parameter
            chatRoomApp.socket.emit('new message', message);

            /*
             *  Save the new message to the database
             */
            var messages = {};
            messages['username'] = chatRoomApp.username;
            messages['content'] = message;
            messages['course'] = chatRoomApp.room;
            messages['tag'] = tag;

            $.post('/add_messages', messages, function(resp) {});

        }
    }

    // Log a message
    chatRoomApp.log = function(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        chatRoomApp.addMessageElement($el, options);
    }

    //Clear all the messages
    chatRoomApp.clearMessages = function() {
        $('.messages')[0].innerHTML = '';
    }

    // Adds the visual chat message to the message list
    chatRoomApp.addChatMessage = function(data, options) {

        options = options || {};

        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
            .css('color', chatRoomApp.getUsernameColor());
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);
        if (data.tag != "notag" && data.tag != "0" && chatRoomApp.instructor || chatRoomApp.admin) {
            var $tagDiv = $('<span class="tagBody">')
                .text("  " + data.tag)
                .css('color', 'aqua');
        } else {
            var $tagDiv = $('<span class="tagBody">')
        }
        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv, $tagDiv);

        chatRoomApp.addMessageElement($messageDiv, options);
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    chatRoomApp.addMessageElement = function(el, options) {
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
            $el.hide().fadeIn(chatRoomApp.FADE_TIME);
        }
        if (options.prepend) {
            chatRoomApp.$messages.prepend($el);
        } else {
            chatRoomApp.$messages.append($el);
        }
        chatRoomApp.$messages[0].scrollTop = chatRoomApp.$messages[0].scrollHeight;
    }

    // Prevents input from having injected markup
    chatRoomApp.cleanInput = function(input) {
        return $('<div/>').text(input).text();
    }

    // Gets the color of a username through our hash function
    chatRoomApp.getUsernameColor = function() {
        return ['red', 'orange', 'yellow', 'green', 'blue', 'purple'][Math.random() * 6 | 0]
    }

    chatRoomApp.$window.keydown(function(event) {
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            console.log(chatRoomApp.valid);
            if (chatRoomApp.valid) {
                chatRoomApp.sendMessage();
            } else {

                $.post('/validateUser', $("#login-form").serialize(), function(resp_data) {

                    if (typeof resp_data === "string") {
                        alert(resp_data);
                        chatRoomApp.valid = false;
                    } else {

                        chatRoomApp.username = chatRoomApp.cleanInput(resp_data[0].username.trim());
                        chatRoomApp.valid = true;
                        chatRoomApp.$loginPage.fadeOut();
                        //chatRoomApp.$chatPage.show();
                        
                        chatRoomApp.$loginPage.off('click');

                        chatRoomApp.socket.emit('add user', username);

                        if (resp_data[0].role == "admin") {
                            chatRoomApp.admin = true;
                            chatRoomApp.adminSetUp();
                            chatRoomApp.createTagFilter();
                        } else if (resp_data[0].role == "instructor") {
                            chatRoomApp.instructor = true;
                            chatRoomApp.createTagFilter();
                        } else {
                            chatRoomApp.student = true;
                        }
                        chatRoomApp.userSetUp(resp_data[0]);
                        chatRoomApp.openProfile();
                        chatRoomApp.profilePage(resp_data[0]);
                    }

                });

            }
        }
    });

    // Click events
    // Focus input when clicking on the message input's border
    chatRoomApp.$inputMessage.click(function() {
        chatRoomApp.$inputMessage.focus();
    });

    // Socket events

    // Whenever the server emits 'login', log the login message
    chatRoomApp.socket.on('login', function(data) {
        chatRoomApp.connected = true;
    });

    // Whenever the server emits 'new message', update the chat body
    chatRoomApp.socket.on('new message', function(data) {
        chatRoomApp.addChatMessage(data);
    });

    /*
     *
     *  Set the onclick handlers for all the students classes.
     *  Used to broadcast to a specific socket
     *
     */
    chatRoomApp.addHandlers = function() {

        let children = $('#class-list')[0].children;

        for (let x = 0; x < children.length; x++) {

            $('#' + children[x].id).on('click', function() {
                chatRoomApp.$profilePage.hide();
                chatRoomApp.$adminPage.hide();
                chatRoomApp.$chatPage.show();
                chatRoomApp.socket.emit('leave-room', chatRoomApp.room);
                chatRoomApp.room = children[x].innerText;
                chatRoomApp.socket.emit('join-room', chatRoomApp.room);
                chatRoomApp.clearMessages();
                var message = "Welcome to " + chatRoomApp.room + "\'s Chat!";
                chatRoomApp.log(message, {
                    prepend: true
                });
                $.get('/get_messages', {
                    course: chatRoomApp.room,
                    tag: chatRoomApp.tagfilter
                }, function(resp_data) {
                    for (let x = 0; x < resp_data.length; x++) {
                        chatRoomApp.addChatMessage({
                            username: resp_data[x]["username"],
                            message: resp_data[x]["content"],
                            tag: resp_data[x]["tag"]
                        });
                    }

                });

            });

        }

    };

    $('#register').submit(function(event) {

        $.post('/register', $(this).serialize(), function(resp) {
            if (typeof resp != "string") {
                
                username = chatRoomApp.cleanInput($('#username').val().trim());
                chatRoomApp.valid = true;
                chatRoomApp.$loginPage.fadeOut();
                //chatRoomApp.$chatPage.show();
                
                chatRoomApp.$loginPage.off('click');
                chatRoomApp.socket.emit('add user', username);
                chatRoomApp.student = true;
                chatRoomApp.userSetUp(resp);
                chatRoomApp.openProfile();
                chatRoomApp.profilePage(resp);

            } else {
                chatRoomApp.valid = false;
                alert("Registration failed");
            }
        });

        event.preventDefault();

    });

    chatRoomApp.init = function(){
      document.getElementById('tag-select').style.display = "none";

    document.getElementById('tag-icon').onclick = function(){
      document.getElementById('tag-icon').style.display = "none";
      document.getElementById('tag-select').style.display = "";
    };

    $("#classtitle").hide();

    $('#register-area').hide();

      $('#register-button').on('click', function(){
        $('#login-area').fadeOut();
        $('#register-area').fadeIn();
      });

      $('#login-button').on('click', function(){
        $('#register-area').fadeOut();
        $('#login-area').fadeIn();
      });
    };

    chatRoomApp.init();


}); 