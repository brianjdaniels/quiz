var quizes = [];
var activeQuiz = 0;
var chosenAnswers = [];


$.getJSON('questions.json', function(data) {
    quizes = data;
    for (var i =0; i < quizes.length; i++){
        var doc = document;
        var form = doc.forms[("answers" + i)]
        var backBtn = doc.getElementById(("back" + i));
        EventUtil.addHandler(backBtn, "click", buttonHandler);
        EventUtil.addHandler(form, "submit", buttonHandler);
        chosenAnswers[i] = [];
        nextQuestion(i,0);
    }
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

//var form = document.forms[("answers" + activeQuiz)];

function nextQuestion(quizNumber, newQ){
    var form = document.forms[("answers" + quizNumber)];
    var question = document.getElementById(("questionText" + quizNumber));
    var oldAnswerList = document.getElementById(("answerList" + quizNumber));
    var answersDiv = document.createElement('div');
    answersDiv.id = "answerList" + quizNumber;
    var choices = quizes[quizNumber][newQ].choices;
    for (var j = 0, len = choices.length; j < len; j++) {
        var choice = document.createElement('div');
        choice.className = "radio col-md-11 col-md-offset-1";
        var input = document.createElement('input');
        var label = document.createElement('label');

        input.id = "ans" + quizNumber + "-" + j;
        input.type = "radio";
        input.name = "q" + newQ;
        input.value = j;

        label.htmlFor = input.id;
        if ( typeof label.textContent == "string" ){
                label.textContent = choices[j];
        }else{
            label.innerText = choices[j];
        }
        label.appendChild(input);
        choice.appendChild(label);
        answersDiv.appendChild(choice);
    }
    if (chosenAnswers[quizNumber][newQ] > -1){
	    var prevChoice;
	    if (answersDiv.firstElementChild) {
            prevChoice = answersDiv.childNodes[chosenAnswers[quizNumber][newQ]].firstElementChild.firstElementChild;
	    }else{
            prevChoice = answersDiv.childNodes[chosenAnswers[quizNumber][newQ]].firstChild.firstChild;
        }
        prevChoice.setAttribute("checked", true);
    }
    $(("#quiz" + quizNumber)).fadeOut( function() {
        question.textContent = quizes[quizNumber][newQ].question;
        question.setAttribute("data-qNum", newQ);
        form.replaceChild(answersDiv, oldAnswerList);
    }).fadeIn();

}

function getChoice(quizNumber, qIndex) {
    var name = "q" + qIndex;
    var answerList = document.forms[("answers" + quizNumber)][name];
    for (var i = 0; i < answerList.length; i++){
        if (answerList[i].checked) {
            chosenAnswers[quizNumber][qIndex] = i;
            break;
        }
    }
}

function getTopScores(quizNumber){
    if (localStorage.users) {
        var topScores = [];
        var users = JSON.parse(localStorage.users);
        for (var user in users){
            if (users[user].scores[quizNumber]) {
            usr = {};
            usr.name = user;
            usr.topScore = Math.max.apply(null, users[user].scores[quizNumber]);
            topScores.push(usr);
	        }
        }
        return sortDownByKey(topScores, "topScore");
    }
    else return [];
}

// Adapted from http://stackoverflow.com/questions/8175093/simple-function-to-sort-a-json-object-using-javascript

function sortDownByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });
}

function printScore(){
    var total = quizes[activeQuiz].length;
    var correct = 0;
    for (var i = 0; i < total; i++){
        if (quizes[activeQuiz][i].correctAnswer === chosenAnswers[activeQuiz][i]) {
            correct++;
        }
    }
    var score = Math.round(correct / total * 100);
    var summary;
    if (score > 60) { summary = "Congratulations!"; } else { summary = "Oh, snap!"; }
    var currentUser = CookieUtil.get("currentUser");
    if ( currentUser) {
	    var scores = [];
        var users = JSON.parse( localStorage.getItem("users") );
	    if ( users[currentUser].scores[activeQuiz] ) {
	        scores = users[currentUser].scores[activeQuiz];
	    }
	    scores.push(score);
        users[currentUser].scores[activeQuiz] = scores;
        localStorage.setItem("users", JSON.stringify(users) );
    }
    var leaderArray = getTopScores(activeQuiz);
    var leaderHTML = document.createElement("ol");
    for (var j = 0, len = leaderArray.length; j < len; j++){
        var li = document.createElement("li");
        li.innerHTML = leaderArray[j].name + ": " + leaderArray[j].topScore;
        if ( leaderArray[j].name === currentUser ){ li.className = "currUsr"; }
        leaderHTML.appendChild(li);
    }
    var div = "quiz" + activeQuiz;
    $(("#" + div)).fadeOut( function() {
        var content = document.getElementById(div);
	    content.innerHTML = "<h1>" + summary + "</h1>" +
            "<p>You answered " + correct + " out of " + total  + " correctly!</p>" +
            "<p> That's " + score  + "%" + "</p>" +
	    "<h3>Leader Board:</h3>";
	    content.appendChild(leaderHTML);
    }).fadeIn();
}

function buttonHandler(e){
    EventUtil.preventDefault(e);
    var btn = ( e.target || e.srcElement ).id;
    var answersRegex = /answers(\d+)/;
    var backRegex = /back(\d+)/;
    var btnCase = "";
    if (answersRegex.exec(btn)){
        btnCase = "answers";
        var result = answersRegex.exec(btn);
        activeQuiz = result[1];
    }else if (backRegex.exec(btn)){
        btnCase = "back";
        var result2 = backRegex.exec(btn);
        activeQuiz = result2[1];
    }else{
        alert("I don't know what button you pressed...Sorry!");
    }
    var question = document.getElementById(("questionText" + activeQuiz));
    var oldQNum = parseInt(question.getAttribute("data-qNum"), 10);
    getChoice(activeQuiz, oldQNum);
    switch (btnCase) {
        case "answers":
            if (chosenAnswers[activeQuiz][oldQNum] === undefined) {
                alert("Please answer the question.");
            } else if (oldQNum < quizes[activeQuiz].length -1) {
                nextQuestion(activeQuiz, oldQNum + 1);
            } else {
                printScore();
            }
            break;
        case "back":
            if (oldQNum === 0){
                alert("This is the first question");
            } else {
                nextQuestion(activeQuiz, oldQNum -1);
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
                CookieUtil.set("currentUser", uname);
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
            scores: []
		};
		localStorage.setItem("users", JSON.stringify(users));
		CookieUtil.set("currentUser", uname);
		$('#createAccountModal').modal('hide');
		welcome();
	    }
	    break;
	    default:
	    alert("Unable to identify button.");
	}
    } else { alert("Please enter a username and password."); }
}


function welcome(){
    if (CookieUtil.get("currentUser")){
	var uname = CookieUtil.get("currentUser");
	loginHolder = signInArea.replaceChild(welcomeHTML, loginForm);
	var welcomeName = document.getElementById("welcomeName");
	welcomeName.innerHTML = uname;
	}
}

function logout(e){
    EventUtil.preventDefault(e);
    CookieUtil.unset("currentUser");
    signInArea.replaceChild(loginHolder, welcomeHTML);
}

var createAccountForm = document.forms["createAccount"];
var loginForm = document.forms["login"];
var signInArea = document.getElementById("signIn");
var loginHolder;
var createAccountHolder;

var welcomeHTML = document.createElement("p");
welcomeHTML.innerHTML = "Welcome, <span id='welcomeName'></span>!";
welcomeHTML.className = "navbar-text";
var logoutHTML = document.createElement("a");
logoutHTML.href = "#";
logoutHTML.innerHTML = "<small>      Logout</small>";
welcomeHTML.appendChild(logoutHTML);

EventUtil.addHandler(logoutHTML, "click", logout);
EventUtil.addHandler(createAccountForm, "submit", loginHandler);
EventUtil.addHandler(loginForm, "submit", loginHandler);
$("div.question").css({display: "none"});

welcome();

