var quizApp = {

    quizzes: [],

    user: {
        username: "",
        chosenAnswers: [],
        location: []
    },


    loadQuiz: function(){
        $.getJSON('questions.json', function(data){
            quizApp.quizzes = data;

            var tabsHTML = quizApp.Utils.render('quizTab', quizApp.quizzes);
            $('#main').append(tabsHTML);

            for (var i=0; i < data.length; i++){

                var answersElementID = "#quiz" + i + "Question";
                var questionHTML = quizApp.Utils.render('quizAnswerList', quizApp.quizzes[i][0]);
                $(answersElementID).append(questionHTML);

                var doc = document;
                var form = doc.forms[("answers" + i)];
                var backBtn = doc.getElementById(("back" + i));

                quizApp.Utils.EventUtil.addHandler(backBtn, "click", quizApp.buttonHandler);
                quizApp.Utils.EventUtil.addHandler(form, "submit", quizApp.buttonHandler);
                quizApp.user.chosenAnswers[i] = [];
                quizApp.user.location[i] = 0;

            }

            $('.nav-tabs li:first').addClass("active");
            $('.tab-content div:first').addClass("active");
            var createAccountForm = document.forms["createAccount"];
            quizApp.Utils.EventUtil.addHandler(createAccountForm, "submit", quizApp.auth.loginHandler);
            quizApp.auth.welcome();
        });
    },

    buttonHandler: function(e){
        quizApp.Utils.EventUtil.preventDefault(e);
        var btn = ( e.target || e.srcElement ).id;
        var btnRegex = /([A-Za-z]+)(\d+)/;
        var btnCase = "";
        var quizNumber;
        var oldQNum;
        if (btnRegex.exec(btn)){
            var result = btnRegex.exec(btn);
            btnCase = result[1];
            quizNumber = result[2];
            oldQNum = quizApp.user.location[quizNumber];
        }else{
            window.alert("I don't know what button you pressed... Sorry!");
        }
        quizApp.getChoice(quizNumber, oldQNum);
        switch (btnCase) {
            case "answers":
                if (quizApp.user.chosenAnswers[quizNumber][oldQNum] === undefined) {   //Can't check for falsey values b/c a 0 index is OK//
                    window.alert("Please answer the question.");
                } else if (oldQNum < quizApp.quizzes[quizNumber].length -1) {
                    quizApp.nextQuestion(quizNumber, ++quizApp.user.location[quizNumber]);
                } else {
                    quizApp.printScore(quizNumber);
                }
                break;
            case "back":
                if (oldQNum === 0){
                    window.alert("This is the first question");
                } else {
                    quizApp.nextQuestion(quizNumber, --quizApp.user.location[quizNumber]);
                }
                break;
            default :
                window.alert("You clicked on " + btn);
        }
    },

    auth: {

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
                quizApp.user.username = quizApp.Utils.CookieUtil.get("currentUser");
            }
            var welcomeHTML = quizApp.Utils.render('login', quizApp.user);
            $('#signIn').html(welcomeHTML);
            if (quizApp.user.username){
                var logout = document.getElementById('logout');
                quizApp.Utils.EventUtil.addHandler(logout, "click", quizApp.auth.logout);
            }else{
                var loginForm = document.forms["login"];
                quizApp.Utils.EventUtil.addHandler(loginForm, "submit", quizApp.auth.loginHandler);
            }
        },

        logout: function(e){
            quizApp.Utils.EventUtil.preventDefault(e);
            quizApp.Utils.CookieUtil.unset("currentUser");
            quizApp.user.username = "";
            quizApp.auth.welcome();
        }

    },

    nextQuestion: function(quizNumber, newQ){

        $(("#quiz" + quizNumber)).fadeOut( function() {
             var nextQuestionHTML = quizApp.Utils.render('quizAnswerList', quizApp.quizzes[quizNumber][newQ]);
             var answersElementID = "#quiz" + quizNumber + "Question";
             $(answersElementID).html(nextQuestionHTML);

             var previousChoiceIndex = quizApp.user.chosenAnswers[quizNumber][newQ];
             if (previousChoiceIndex > -1){
                 var selector = "#quiz" + quizNumber + "Question div.radio:eq(" + previousChoiceIndex + ") input";
                 $(selector).attr("checked", "checked");
             }

         }).fadeIn();
     },

    getChoice: function(quizNumber, qIndex) {
        var answerList = document.forms[("answers" + quizNumber)]["placeholder"];
        for (var i = 0; i < answerList.length; i++){
            if (answerList[i].checked) {
                quizApp.user.chosenAnswers[quizNumber][qIndex] = i;
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
                        if (user === quizApp.user.username){
                            usr.currUsr = 1;
                        }
                        topScores.push(usr);
                    }
                }
            }
            return quizApp.Utils.sortDownByKey(topScores, "topScore");
        }
        else { return []; }
    },

    printScore: function(quizNumber){
        var context = {
            correct: 0,
            total: 0,
            percentCorrect: 0,
            passing: 0
        };

        var quizArray = quizApp.quizzes[quizNumber];

        context.total = quizArray.length;
        context.correct = 0;
        for (var i = 0; i < context.total; i++){
            if (quizArray[i].correctAnswer === quizApp.user.chosenAnswers[quizNumber][i]) {
                context.correct++;
            }
        }
        context.percentCorrect = Math.round(context.correct / context.total * 100);
        if (context.percentCorrect > 60) { context.passing = 1; }

        var currentUser = quizApp.Utils.CookieUtil.get("currentUser");

        if ( currentUser) {
            var scores = [];
            var users = JSON.parse( localStorage.getItem("users") );
            if ( users[currentUser].scores[quizNumber] ) {
                scores = users[currentUser].scores[quizNumber];
            }
            scores.push(context.percentCorrect);
            users[currentUser].scores[quizNumber] = scores;
            localStorage.setItem("users", JSON.stringify(users) );
        }

        var leaderArray = quizApp.getTopScores(quizNumber);
        var leaderHTML = quizApp.Utils.render('leaderBoard', leaderArray);
        var summaryHTML = quizApp.Utils.render('summary', context);

        $(("#quiz" + quizNumber)).fadeOut(
            function(){
                $(this).html(summaryHTML + leaderHTML);
            }
        ).fadeIn();
    },


    Utils: {
        // Adapted from http://stackoverflow.com/questions/8175093/simple-function-to-sort-a-json-object-using-javascript

        sortDownByKey: function (array, key) {
            return array.sort(function(a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? 1 : ((x > y) ? -1 : 0));
            });
        },

        render: function (tmpl_name, tmpl_data) {
            if ( !quizApp.Utils.render.tmpl_cache ) {
                quizApp.Utils.render.tmpl_cache = {};
            }

            if ( ! quizApp.Utils.render.tmpl_cache[tmpl_name] ) {
                var tmpl_dir = '/templates';
                var tmpl_url = tmpl_dir + '/' + tmpl_name + '.hbs';

                var tmpl_string;
                $.ajax({
                    url: tmpl_url,
                    method: 'GET',
                    async: false,
                    success: function(data) {
                        tmpl_string = data;
                    }
                });

                quizApp.Utils.render.tmpl_cache[tmpl_name] = Handlebars.compile(tmpl_string);
            }

            return quizApp.Utils.render.tmpl_cache[tmpl_name](tmpl_data);
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
