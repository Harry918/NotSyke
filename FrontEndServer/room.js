var questionList = require('./questions/questions.json')

class Room {
    constructor() {
      this.userList = [];
      this.answers = 0;
      this.choices = 0;
      this.player_ready = 0;
      this.player_num = -1;
      this.question_requests = 0;
      this.inGame = false;
      this.waitingRoom = [];
      this.rounds = 7;
      this.page = '';
      this.questions = [];
      this.generateRandomQuestions();
    }

    generateRandomQuestions() {
      for (let i = 0; i < this.rounds; i++) {
        let questionID = Math.floor(Math.random() * 120);
        while (this.questions.indexOf(questionID) != -1) {
          questionID = Math.floor(Math.random() * 120);
        }
        this.questions.push(questionID);
      }
    }

    getNextQuestion() {
      return questionList.questions[this.questions.shift()];
    }

    isNextQuestion() {
      this.question_requests += 1;
      return this.question_requests == this.userList.length;
    }

    getNextPlayer() {
      this.player_num += 1;
      this.player_num = this.player_num % this.userList.length;
      return this.userList[this.player_num];
    }

    resetQuestionRequests() {
      this.question_requests = 0;
    }

    resetResponses() {
      this.answers = 0;
      this.choices = 0;
    }

    uniqueName(name) {
      return this.userList.findIndex((user) => user.name === name) === -1;
    }

    static randomizeList(lst) {
      let temp, newList
      temp = Array.from(lst);
      newList = [];
      while (temp.length != 0) {
        newList.push(temp.splice(Math.floor(Math.random() * Math.floor(temp.length)), 1)[0]);
      }
      return newList;
    }

    sortByPoints() {
      let pointsList = Object.create(this.userList);
      pointsList.sort((x, y) => {
        let keyA = x.points;
        let keyB = y.points;
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });
      return pointsList;
    }
  }

  module.exports = Room;
