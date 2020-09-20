const Room = require('./room.js');
const User = require('./user.js');
const express = require('express');
//express is being used for FrontEndServer
const socketio = require('socket.io');
const http = require('http');

const {addUser, removeUser, getUser, getUsersInRoom, generateRoomID} = require('./groups');
const PORT = process.env.PORT || 5000;

const router = require('./router');
const { disconnect } = require('process');

const app = express();

const server = http.createServer(app);

const io = socketio(server);

var roomList = {};



app.get('/', (req, res) => {
  return res.send('Received a GET HTTP method');
});

io.on('connection', function(socket) {

  socket.on('join', function({type, name, room}) {
    // name = name.trim().toLowerCase();
    if (type === 'Create') {
      room = generateRoomID().toString()
      while(roomList.hasOwnProperty(room)) {
        room = generateRoomID().toString()
      }
      socket.join(room);
      const roomObj = new Room(); //contains info about the room; the key is still room id
      roomObj.page = 'waiting';
      roomList[room] = roomObj;
      const user = new User(name, socket.id)
      roomObj.userList.push(user);
      let members = roomList[room].userList.map(({name}) => name);
      socket.emit('user-info', {roomID: room, members: members, waiting: false, userID: user.id});

    }
    else if (roomList.hasOwnProperty(room)) {

      if (roomList[room].uniqueName(name)) {
        socket.join(room);
        if (roomList[room].inGame === false) {
        const user = new User(name, socket.id );
        roomList[room].userList.push(user);
        let members = roomList[room].userList.map(({name}) => name);
        roomList[room].page = 'waiting';
        socket.emit('userID', {userID: user.id})
        socket.emit('user-info', {roomID: room, members: members, waiting: false, userID: user.id})
        io.in(room).emit('waiting-info', {roomID: room, members: members, waiting: false});
        }
        else {
          const user = new User(name, socket.id);
          roomList[room].waitingRoom.push(user);
          let members = roomList[room].userList.map(({name}) => name);
          let temp = roomList[room].waitingRoom.map(({name}) => name);
          members = members.concat(temp);
          socket.emit('user-info', {roomID: room, members: members, waiting: true, userID: user.id})
        }
      } else {
        socket.emit('error1', {error: "Name is already taken"});
      }
    } else {
        socket.emit('error1', {error: 'No room found'});
      }

      
  });

  socket.on('start_game' , ({room, name, disconnect}) => {checkWaitingPeople(room, name, disconnect)})

  function checkWaitingPeople(room, name, disconnect){
    try{

      if (disconnect !== undefined && !disconnect){
        roomList[room].player_ready++;
        roomList[room].userList.find((user) => user.name === name).waiting = true;
      }

      if (roomList[room] && roomList[room].player_ready === roomList[room].userList.length &&
          roomList[room].player_ready !== 0) {
        roomList[room].userList = Room.randomizeList(roomList[room].userList);
        roomList[room].inGame = true
        roomList[room].player_ready = 0
        for (i in roomList[room].userList.length){
            roomList[room].userList[i].waiting = false
        }
        roomList[room].page = 'questions';
        io.in(room).emit('start', {start: true});
      }
    }
    catch(err){

    }
  };

  socket.on('requestPrompt', function({room}) {
      
    try{
    if (roomList[room] && roomList[room].isNextQuestion()) {

      roomList[room].page = 'questions';
      let user = roomList[room].getNextPlayer().name;
      // let phrase = roomList[room].getRandomQuestion();
      let phrase = roomList[room].getNextQuestion();

      let question = phrase.first;
      question = question.concat(user, phrase.second)
      roomList[room].resetResponses();
      roomList[room].rounds--;
      for (i in roomList[room].userList){
        roomList[room].userList[i].answer = null;
      }
      io.in(room).emit('sentPrompt', {question: question});
    }
    }
    catch(err){

    }
  });

 socket.on('submitAnswer' , ({room, name, answer, disconnect}) => {submitAnswer(room, name, answer, disconnect)});

 function submitAnswer(room, name, answer, disconnect) {

   try{
      if (disconnect !== undefined && !disconnect) {

        roomList[room].userList.find((user) => user.name === name).answer = answer;
        roomList[room].answers++;
      }

      if (roomList[room].answers == roomList[room].userList.length) {
        answerInfo = Room.randomizeList(roomList[room].userList.map(user => ({id: user.id, answer: user.answer})));
        roomList[room].page = 'answers'
        io.in(room).emit('displayAnswers', { answerInfo: answerInfo});
      };
    }
  catch(err){

    }
}

 socket.on('chooseAnswer', ({room, userID, disconnect}) => {chooseAnswer(room, userID, disconnect)});

 function chooseAnswer(room, userID, disconnect) {
   try{
      let exit
        if (disconnect !== undefined && !disconnect) {
          roomList[room].resetQuestionRequests();
          if(roomList[room].userList.find((user) => user.id === userID)){
            roomList[room].userList.find((user) => user.id === userID).points++;
          }
          roomList[room].choices++;
        }
        if (roomList[room].choices == roomList[room].userList.length) {
          roomList[room].choices = 0;
          roomList[room].page = 'points'
          exit = roomList[room].rounds === 0 ? true: false;

          io.in(room).emit('displayPoints', {choiceInfo: roomList[room].sortByPoints().map(each => 
            ({name: each.name, points: each.points, answer: each.answer, exit: exit}))});
      }
    }
    catch(err){

    }
 };

 socket.on('ready',({room, disconnect, name }) => {favoriteAnswerChoice(room, disconnect, name)});

 function favoriteAnswerChoice(room, disconnect, name) {
   try{
      if (disconnect !== undefined && !disconnect) {
        
        roomList[room].choices++;
        roomList[room].userList[roomList[room].userList.findIndex((user) => user.name === name)].done = true
      }
      if (roomList[room].choices === roomList[room].userList.length) {
      roomList[room].choices = 0
      for(i in roomList[room].userList) {
        roomList[room].userList[i].done = false
      }
      if (roomList[room].waitingRoom.length) {
        roomList[room].userList = roomList[room].userList.concat(roomList[room].waitingRoom);
        roomList[room].waitingRoom = [];
      }
      io.in(room).emit('next_question', {start: true});
      }
    }
    catch(err){

    }
  }
  socket.on('disconnect', () => {
    try {

      var i, roomID;
      const temp = Object.keys(socket.adapter.rooms)

      
      for (i in temp){
  
        if (temp[i].length === 3 ){
            roomID = temp[i];

            break
        }
      }
      
      if (roomList[roomID]) {

        const page = roomList[roomID].page;

        let index = roomList[roomID].userList.findIndex((user) => user.socket_id === socket.id);

        if (index >= 0) {

          const name = roomList[roomID].userList[index].name;    
          removeUser(roomID, name, page);
        } else {

        }
      }
    }
    catch(err){

    }

})

 socket.on('remove_user', ({roomID, name, part}) => {removeUser(roomID, name, part)});

 function removeUser(roomID, name, part) {

  try {
      let removeIndex
      if (roomList[roomID]) {
        //  if(roomList[roomID].userList.findIndex((user) => user.name === name) != -1){
        //   removeIndex = roomList[roomID].userList.findIndex((user) => user.name === name)
        //   roomList[roomID].userList.splice(removeIndex, 1);
        //  }
        if (part === '1'){
          part = roomList[roomID].page
        }

        if (part !== 'waiting'){

          //for the people who are in the wating room, emit who left
                if (roomList[roomID].userList[roomList[roomID].userList.findIndex((user) => user.name === name)].answer !== null) {
            if (part === 'questions') {

              roomList[roomID].answers--;
            } else if (part === 'answers') {

              roomList[roomID].choices--;
            }
          } else if (roomList[roomID].userList[roomList[roomID].userList.findIndex((user) => user.name === name)].choices === true 
                     && part === 'points') {

            roomList[roomID].choices--;
          }
          roomList[roomID].userList.splice(roomList[roomID].userList.findIndex((user) => user.name === name), 1); 
        }
        
        roomList[roomID].userList.length || roomList[roomID].waitingRoom.length ? null : delete roomList[roomID];
        switch (part) {
          case 'waiting':
            if (roomList[roomID].userList.findIndex((user) => user.name === name) >= 0 ) {
              // decrease actual players

              roomList[roomID].userList.splice(roomList[roomID].userList.findIndex((user) => user.name === name), 1);
              let members = roomList[roomID].userList.map(({name}) => name);
              io.in(roomID).emit('waiting-info', {roomID: roomID, members: members, waiting: false});
              checkWaitingPeople(roomID, name, true)
            }
            else {
              // decrease late people
              roomList[roomID].waitingRoom.splice(roomList[roomID].waitingRoom.findIndex((user) => user.name === name), 1);
            }
            break;
          case 'questions': //not answered the question yet

            submitAnswer(roomID,'', '', true)

            break;
          case 'answers':
  
              if(roomList[roomID].page === 'points'){
                  favoriteAnswerChoice(roomID, true, name);
              }
              else{
                  chooseAnswer(roomID, '', true);
              }

            break;
          case 'points':

            favoriteAnswerChoice(roomID, true, name);

            break;
          default:
            break;
        };
        if ((roomList[roomID] && roomList[roomID].userList.length <= 1 && part !== 'end') 
        || (roomList[roomID].userList.length < 1 && part === 'end')) {
          
          io.in(roomID).emit('return_home');

          //create endpoint for exiting
          // delete roomList[roomID];
          return;
        }
      }
      socket.disconnect()
     }
     catch(err){

    }
   }
});


app.use(router);

server.listen(PORT, () => console.log(`Server has started`));
