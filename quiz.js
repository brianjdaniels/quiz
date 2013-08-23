var questions = [];

$.getJSON('questions.json', function(data) {
    questions = data;
    nextQuestion(0);
});


/////// CROSS-BROWSER EVENT UTIL AND COOKIE UTIL ////////
/// From http://www.wrox.com/WileyCDA/WroxTitle/Professional-JavaScript-for-Web-Developers-3rd-Edition.productCd-1118026691,descCd-DOWNLOAD.html

var EventUtil = {

    addHandler: function(element, type, handler){
        if (element.addEventListener){
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent){
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },

    preventDefault: function(event){
        if (event.preventDefault){
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },

    removeHandler: function(element, type, handler){
        if (element.removeEventListener){
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent){
            element.detachEvent("on" + type, handler);
        } else {
            element["on" + type] = null;
        }
    }
};

var CookieUtil = {

    get: function (name){
        var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null,
            cookieEnd;

        if (cookieStart > -1){
            cookieEnd = document.cookie.indexOf(";", cookieStart);
            if (cookieEnd == -1){
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
        }

        return cookieValue;
    },

    set: function (name, value, expires, path, domain, secure) {
        var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        if (expires instanceof Date) {
            cookieText += "; expires=" + expires.toGMTString();
        }

        if (path) {
            cookieText += "; path=" + path;
        }

        if (domain) {
            cookieText += "; domain=" + domain;
        }

        if (secure) {
            cookieText += "; secure";
        }

        document.cookie = cookieText;
    },

    unset: function (name, path, domain, secure){
        this.set(name, "", new Date(0), path, domain, secure);
    }

};
////////////////////////////////////////

var chosenAnswers = [];
var form = document.forms['answers'];

function nextQuestion(newQ){
    var question = document.getElementById("questionText");
    var oldAnswerList;
    if (form.firstElementChild) {
	oldAnswerList = form.firstElementChild;
	} else {
	    oldAnswerList = form.firstChild;
	}
    var ul = document.createElement('ul');
    ul.id = "answerList";
    var choices = questions[newQ].choices;
    for (var j = 0, len = choices.length; j < len; j++) {
        var li = document.createElement('li');
        var input = document.createElement('input');
        var label = document.createElement('label');

        input.id = "ans" + j;
        input.type = "radio";
        input.name = "q" + newQ;
        input.value = j;

        label.htmlFor = input.id;
	if ( typeof label.textContent == "string" ){
            label.textContent = choices[j];
	}else{
	    label.innerText = choices[j];
	}
        li.appendChild(input);
        li.appendChild(label);
        ul.appendChild(li);
    }
    if (chosenAnswers[newQ] > -1){
        var prevChoice = ul.childNodes[chosenAnswers[newQ]].firstChild;
        prevChoice.setAttribute("checked", true);
    }
    $('div.question').fadeOut( function() {
        question.textContent = questions[newQ].question;
        question.setAttribute("data-qNum", newQ);
        form.replaceChild(ul, oldAnswerList);
    }).fadeIn();

}

function getChoice(qIndex) {
    var name = "q" + qIndex;
    var answerList = document.forms["answers"][name];
    for (var i = 0; i < answerList.length; i++){
        if (answerList[i].checked) {
            chosenAnswers[qIndex] = i;
            break;
        }
    }
}

function printScore(){
    var total = questions.length;
    var correct = 0;
    for (var i = 0; i < total; i++){
        if (questions[i].correctAnswer === chosenAnswers[i]) {
            correct++;
        }
    }
    var score = Math.round(correct / total * 100);
    if ( localStorage.currentUser ) {
	var currentUser = localStorage.getItem("currentUser");
	var users = JSON.parse( localStorage.getItem("users") );
	var scores = [];
	if ( users[currentUser].scores ) {
	    scores = users[currentUser].scores;
	}
	scores.push(score);
	users[currentUser].scores = scores;
	localStorage.setItem("users", JSON.stringify(users) );
    }
    $("body").fadeOut( function() {
        document.body.innerHTML = "<header>Congratulations!</header>" +
            "<p>You answered " + correct + " out of " + total  + " correctly!</p>" +
            "<p> That's " + score  + "%" + "</p>";
    }).fadeIn();
}

function buttonHandler(e){
    EventUtil.preventDefault(e);
    var btn = ( e.target || e.srcElement ).id;
    var question = document.getElementById("questionText");
    var oldQNum = parseInt(question.getAttribute("data-qNum"), 10);
    getChoice(oldQNum);
    switch (btn) {
        case "answers":
            if (chosenAnswers[oldQNum] === undefined) {
                alert("Please answer the question.");
            } else if (oldQNum < questions.length -1) {
                nextQuestion(oldQNum + 1);
            } else {
                printScore();
            }
            break;
        case "back":
            if (oldQNum === 0){
                alert("This is the first question");
            } else {
                nextQuestion(oldQNum -1);
            }
            break;
        default :
            alert("You clicked on " + btn);
    }
}

function loginHandler(e){
    EventUtil.preventDefault(e);
    var btn = ( e.target || e.srcElement ).id;
    var uname = this.elements[0].value;
    var pword = this.elements[1].value;
    var users = {};
    if (uname && pword){
	if (localStorage.users) {
	    users = JSON.parse(localStorage.getItem("users"));
	}
	switch (btn) {
	    case "login":
		if (users[uname]){
		    if (users[uname].password === pword){
			localStorage.setItem("currentUser", uname);
			welcome();
		    } else { alert("Sorry, wrong password"); }
		} else { alert("Hmm... I don't see a username like that :/"); }
	    break;
	    case "createAccount":
	    if (users[uname]){
		alert("That username is already taken. Please try another");
	    } else {
		users[uname] = {
		    password: pword,
		};
		localStorage.setItem("users", JSON.stringify(users));
		localStorage.setItem("currentUser", uname);
		welcome();
	    }
	    break;
	    default:
	    alert("Unable to identify button.");
	}
    } else { alert("Please enter a username and password."); }
}


function welcome(){
    if (localStorage.currentUser){
	var uname = localStorage.getItem("currentUser");
	loginHolder = signInArea.replaceChild(welcomeHTML, loginForm);
    createAccountHolder = signInArea.removeChild(createAccountForm);
    var welcomeName = document.getElementById("welcomeName");
    welcomeName.innerHTML = uname;
	}
}

function logout(){
    localStorage.currentUser = "";
    signInArea.replaceChild(loginHolder, welcomeHTML);
    signInArea.appendChild(createAccountHolder);
}

var createAccountForm = document.forms["createAccount"];
var loginForm = document.forms["login"];
var backBtn = form.children["back"];
var signInArea = document.getElementById("signIn");
var loginHolder;
var createAccountHolder;

var welcomeHTML = document.createElement("p");
welcomeHTML.innerHTML = "Welcome, <span id='welcomeName'></span>!      <small><a href='#' onclick='logout()'>Logout</a></small>";

EventUtil.addHandler(createAccountForm, "submit", loginHandler);
EventUtil.addHandler(loginForm, "submit", loginHandler);
EventUtil.addHandler(form, "submit", buttonHandler);
EventUtil.addHandler(backBtn, "click", buttonHandler);
$("div.question").css({display: "none"});
welcome();

