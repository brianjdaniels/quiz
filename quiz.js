
var questions = [{
    question: "Who's the boss?",
    choices: ["Brian", "Bryan", "Some other dude", "Justin"],
    correctAnswer: 0
    },
    {
    question: "How do you feel?",
    choices: ["Hungry", "Angry", "Hangry"],
    correctAnswer: 2
    },
    {
    question: "What is the best city?",
    choices: ["Fort Wayne", "Chicago", "Grand Rapids"],
    correctAnswer: 1
    }];

/////// CROSS-BROWSER EVENT UTIL ////////
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


////////////////////////////////////////

var chosenAnswers = [];
var form = document.forms['answers'];

function nextQuestion(newQ){
    var question = document.getElementById("questionText");
    var oldAnswerList = form.firstElementChild;

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
        label.textContent = choices[j];

        li.appendChild(input);
        li.appendChild(label);
        ul.appendChild(li);
    }
    if (chosenAnswers[newQ] > -1){
        var prevChoice = ul.childNodes[chosenAnswers[newQ]].firstChild;
        prevChoice.setAttribute("checked", true);
    }
    $('article.question').fadeOut( function() {
        question.textContent = questions[newQ].question;
        question.dataset.qNum = newQ;
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
    $("body").fadeOut( function() {
        document.body.innerHTML = "<header>Congratulations!</header>" +
            "<p>You answered " + correct + " out of " + total  + " correctly!</p>" +
            "<p> That's " + Math.round(correct / total * 100) + "%" + "</p>";
    }).fadeIn();
}

function buttonHandler(e){
    e.preventDefault();
    var btn = e.target.id;
    var question = document.getElementById("questionText");
    var oldQNum = parseInt(question.dataset.qNum, 10);
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

EventUtil.addHandler(form, "submit", buttonHandler);

//form.addEventListener("submit", buttonHandler);

var backBtn = form.children["back"];
EventUtil.addHandler(backBtn, "click", buttonHandler);

//backBtn.addEventListener("click", buttonHandler);

$("article.question").css({display: "none"});
if (questions) {nextQuestion(0);}

