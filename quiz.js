
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
    question: "How do you feel 2?",
    choices: ["Hungry", "Angry", "Hangry"],
    correctAnswer: 2
    }];

var chosenAnswers = [];

function nextQuestion(newQ){
    var question = document.getElementById("questionText");
    var oldAnswers = document.getElementById("answers");
    var oldAnswerList = document.getElementById("answerList");

    question.textContent = questions[newQ].question;
    question.dataset.qNum = newQ;
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
    oldAnswers.replaceChild(ul, oldAnswerList);
}

function getChoice(name) {
    var answerList = document.forms["answers"][name];
    for (var i = 0; i < answerList.length; i++){
        if (answerList[i].checked) {
            chosenAnswers.push(i);
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
    document.body.innerHTML = "<header>Congratulations!</header>" +
        "<p>You answered " + correct + " out of " + total  + " correctly!</p>" +
        "<p> That's " + Math.round(correct / total * 100) + "%" + "</p>";
}

var form = document.getElementById("answers");

form.addEventListener("submit", function(e) {
    var question = document.getElementById("questionText");
    var oldQNum = parseInt(question.dataset.qNum);
    getChoice("q" + oldQNum);

    if (oldQNum < (questions.length - 1)){
        nextQuestion(oldQNum + 1);
    }else{
        printScore();
    }
    e.preventDefault();
});

if (questions) {nextQuestion(0)};

