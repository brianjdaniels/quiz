
var questions = [],
    q1 = {},
    q2 = {},
    q3 = {},
    q4 = {},
    q5 = {};

q1 = {
    question: "Who's the boss?",
    choices: ["Brian", "Bryan", "Some other dude", "Justin"],
    correctAnswer: 0
};

q2 = {
    question: "How do you feel?",
    choices: ["Hungry", "Angry", "Hangry"],
    correctAnswer: 2
};

questions.push(q1, q2);

function nextQuestion(newQ){
    var question = document.getElementById("questionText");
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
    var oldAnswers = document.getElementById("answers");
    var oldAnswerList = document.getElementById("answerList");
    oldAnswers.replaceChild(ul, oldAnswerList);
}

var form = document.getElementById("answers");

form.addEventListener("submit", function(e) {
    e.preventDefault();
    var question = document.getElementById("questionText");
    var oldQNum = parseInt(question.dataset.qNum);

    if (oldQNum < (questions.length - 1)){
        nextQuestion(oldQNum + 1);
    }else{
        alert("Last Question!")
    }
});

nextQuestion(0);

