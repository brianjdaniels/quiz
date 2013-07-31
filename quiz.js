
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

var question = document.getElementById("questionText");

console.log(question);

question.textContent = questions[0].question;

var ul = document.createElement('ul');
ul.id = "answerList";

var i = 0;
var choices = questions[0].choices;

for (var j = 0, len = choices.length; j < len; j++) {
    var li = document.createElement('li');
    var input = document.createElement('input');
    var label = document.createElement('label');

    input.id = "ans" + j;
    input.type = "radio";
    input.name = "q" + i;
    input.value = j;

    label.htmlFor = input.id;
    label.textContent = questions[0].choices[j];

    li.appendChild(input);
    li.appendChild(label);
    ul.appendChild(li);
}



console.log(ul);

var oldAnswers = document.getElementById("answers");
var oldAnswerList = document.getElementById("answerList");

oldAnswers.replaceChild(ul, oldAnswerList);