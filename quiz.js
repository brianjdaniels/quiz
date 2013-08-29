var quizApp = {

    quizzes: [],
    chosenAnswers: [],

    loadQuiz: function(){
        $("div.question").css({display: "none"});

        $.getJSON('questions.json', function(data) {
            quizApp.quizzes = data;
            for (var i =0; i < data.length; i++){
                var doc = document;
                var form = doc.forms[("answers" + i)];
                var backBtn = doc.getElementById(("back" + i));
                quizApp.Utils.EventUtil.addHandler(backBtn, "click", quizApp.buttonHandler);
                quizApp.Utils.EventUtil.addHandler(form, "submit", quizApp.buttonHandler);
                quizApp.chosenAnswers[i] = [];
                quizApp.nextQuestion(i,0);
            }
        });
        quizApp.auth.setUpLoginElements();
        quizApp.auth.welcome();
    },

    buttonHandler: function(e){
        quizApp.Utils.EventUtil.preventDefault(e);
        var btn = ( e.target || e.srcElement ).id;
        var btnRegex = /([A-Za-z]+)(\d+)/;
        var btnCase = "";
        var activeQuiz = "";
        if (btnRegex.exec(btn)){
            var result = btnRegex.exec(btn);
            btnCase = result[1];
            activeQuiz = result[2];
        }else{
            window.alert("I don't know what button you pressed... Sorry!")
        }
        var question = document.getElementById(("questionText" + activeQuiz));
        var oldQNum = parseInt(question.getAttribute("data-qNum"), 10);
        quizApp.getChoice(activeQuiz, oldQNum);
        switch (btnCase) {
            case "answers":
                if (quizApp.chosenAnswers[activeQuiz][oldQNum] === undefined) {
                    window.alert("Please answer the question.");
                } else if (oldQNum < quizApp.quizzes[activeQuiz].length -1) {
                    quizApp.nextQuestion(activeQuiz, oldQNum + 1);
                } else {
                    quizApp.printScore(activeQuiz);
                }
                break;
            case "back":
                if (oldQNum === 0){
                    window.alert("This is the first question");
                } else {
                    quizApp.nextQuestion(activeQuiz, oldQNum -1);
                }
                break;
            default :
                window.alert("You clicked on " + btn);
        }
    },

    auth: {

        createAccountForm: document.forms["createAccount"],
        loginForm: document.forms["login"],
        signInArea: document.getElementById("signIn"),
        welcomeHTML: document.createElement("p"),
        logoutHTML: document.createElement("a"),

        loginHolder: "",

        setUpLoginElements: function(){
            quizApp.auth.welcomeHTML.innerHTML = "Welcome, <span id='welcomeName'></span>!";
            quizApp.auth.welcomeHTML.className = "navbar-text";
            quizApp.auth.logoutHTML.href = "#";
            quizApp.auth.logoutHTML.innerHTML = "<small>      Logout</small>";
            quizApp.auth.welcomeHTML.appendChild(quizApp.auth.logoutHTML);
            quizApp.Utils.EventUtil.addHandler(quizApp.auth.logoutHTML, "click", quizApp.auth.logout);
            quizApp.Utils.EventUtil.addHandler(quizApp.auth.createAccountForm, "submit", quizApp.auth.loginHandler);
            quizApp.Utils.EventUtil.addHandler(quizApp.auth.loginForm, "submit", quizApp.auth.loginHandler);
        },

        loginHandler: function(e){
            quizApp.Utils.EventUtil.preventDefault(e);
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
                                quizApp.Utils.CookieUtil.set("currentUser", uname);
                                quizApp.auth.welcome();
                            } else { window.alert("Sorry, wrong password"); }
                        } else { window.alert("Hmm... I don't see a username like that :/"); }
                        break;
                    case "createAccount":
                        if (users[uname]){
                            window.alert("That username is already taken. Please try another");
                        } else {
                            users[uname] = {
                                password: pword,
                                scores: []
                            };
                            localStorage.setItem("users", JSON.stringify(users));
                            quizApp.Utils.CookieUtil.set("currentUser", uname);
                            $('#createAccountModal').modal('hide');
                            quizApp.auth.welcome();
                        }
                        break;
                    default:
                        window.alert("Unable to identify button.");
                }
            } else { window.alert("Please enter a username and password."); }
        },

        welcome: function(){
            if (quizApp.Utils.CookieUtil.get("currentUser")){
                var uname = quizApp.Utils.CookieUtil.get("currentUser");
                quizApp.auth.loginHolder = quizApp.auth.signInArea.replaceChild(quizApp.auth.welcomeHTML, quizApp.auth.loginForm);
                var welcomeName = document.getElementById("welcomeName");
                welcomeName.innerHTML = uname;
            }
        },

        logout: function(e){
            quizApp.Utils.EventUtil.preventDefault(e);
            quizApp.Utils.CookieUtil.unset("currentUser");
            quizApp.auth.signInArea.replaceChild(quizApp.auth.loginHolder, quizApp.auth.welcomeHTML);
        }

    },

    nextQuestion: function(quizNumber, newQ){
        var form = document.forms[("answers" + quizNumber)];
        var question = document.getElementById(("questionText" + quizNumber));
        var oldAnswerList = document.getElementById(("answerList" + quizNumber));
        var answersDiv = document.createElement('div');
        answersDiv.id = "answerList" + quizNumber;
        var choices = quizApp.quizzes[quizNumber][newQ].choices;
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
        var previousChoiceIndex = quizApp.chosenAnswers[quizNumber][newQ];
        if (previousChoiceIndex > -1){
            var previousChoiceElement;
            if (answersDiv.firstElementChild) {
                previousChoiceElement = answersDiv.childNodes[previousChoiceIndex].firstElementChild.firstElementChild;
            }else{
                previousChoiceElement = answersDiv.childNodes[previousChoiceIndex].firstChild.firstChild;
            }
            previousChoiceElement.setAttribute("checked", true);
        }
        $(("#quiz" + quizNumber)).fadeOut( function() {
            question.textContent = quizApp.quizzes[quizNumber][newQ].question;
            question.setAttribute("data-qNum", newQ);
            form.replaceChild(answersDiv, oldAnswerList);
        }).fadeIn();
    },

    getChoice: function(quizNumber, qIndex) {
        var radioName = "q" + qIndex;
        var answerList = document.forms[("answers" + quizNumber)][radioName];
        for (var i = 0; i < answerList.length; i++){
            if (answerList[i].checked) {
                quizApp.chosenAnswers[quizNumber][qIndex] = i;
                break;
            }
        }
    },

    getTopScores: function(quizNumber){
        if (localStorage.users) {
            var topScores = [];
            var users = JSON.parse(localStorage.users);
            for (var user in users){
                if (users.hasOwnProperty(user)){
                    if (users[user].scores[quizNumber]) {
                        var usr = {};
                        usr.name = user;
                        usr.topScore = Math.max.apply(null, users[user].scores[quizNumber]);
                        topScores.push(usr);
                    }
                }
            }
            return quizApp.Utils.sortDownByKey(topScores, "topScore");
        }
        else { return []; }
    },

    printScore: function(quizNumber){
        var quizArray = quizApp.quizzes[quizNumber];
        var total = quizArray.length;
        var correct = 0;
        for (var i = 0; i < total; i++){
            if (quizArray[i].correctAnswer === quizApp.chosenAnswers[quizNumber][i]) {
                correct++;
            }
        }
        var score = Math.round(correct / total * 100);
        var summary;
        if (score > 60) { summary = "Congratulations!"; } else { summary = "Oh, snap!"; }
        var currentUser = quizApp.Utils.CookieUtil.get("currentUser");
        if ( currentUser) {
            var scores = [];
            var users = JSON.parse( localStorage.getItem("users") );
            if ( users[currentUser].scores[quizNumber] ) {
                scores = users[currentUser].scores[quizNumber];
            }
            scores.push(score);
            users[currentUser].scores[quizNumber] = scores;
            localStorage.setItem("users", JSON.stringify(users) );
        }
        var leaderArray = quizApp.getTopScores(quizNumber);
        var leaderHTML = document.createElement("ol");
        for (var j = 0, len = leaderArray.length; j < len; j++){
            var li = document.createElement("li");
            li.innerHTML = leaderArray[j].name + ": " + leaderArray[j].topScore;
            if ( leaderArray[j].name === currentUser ){ li.className = "currUsr"; }
            leaderHTML.appendChild(li);
        }
        var div = "quiz" + quizNumber;
        $(("#" + div)).fadeOut( function() {
            var content = document.getElementById(div);
            content.innerHTML = "<h1>" + summary + "</h1>" +
                "<p>You answered " + correct + " out of " + total  + " correctly!</p>" +
                "<p> That's " + score  + "%" + "</p>" +
                "<h3>Leader Board:</h3>";
            content.appendChild(leaderHTML);
        }).fadeIn();
    },


    Utils: {
        // Adapted from http://stackoverflow.com/questions/8175093/simple-function-to-sort-a-json-object-using-javascript

        sortDownByKey: function (array, key) {
            return array.sort(function(a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? 1 : ((x > y) ? -1 : 0));
            });
        },

        /////// CROSS-BROWSER EVENT UTIL AND COOKIE UTIL ////////
        /// From http://www.wrox.com/WileyCDA/WroxTitle/Professional-JavaScript-for-Web-Developers-3rd-Edition.productCd-1118026691,descCd-DOWNLOAD.html

        EventUtil : {

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
        },

        CookieUtil: {

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
        }
    }
};

quizApp.loadQuiz();
