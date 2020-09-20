import React, {useState, useEffect} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
 import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../store/actions'
import { useHistory } from "react-router-dom";
import MuiAlert from '@material-ui/lab/Alert';
import './Question.css';


let color;

const useStyles = makeStyles((theme) => ({
  Button: {
    "&:hover": {
      backgroundColor: ({ color}) => `${color}`
    },
    borderColor: ({color}) => `${(color)}`,
  }, 

}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Game = (props) => {
  let history = useHistory();
  //Access redux state tree:
  let socket = useSelector(state=> state.socket)
  let roomID = useSelector(state => state.roomID)
  let name = useSelector(state => state.name)
  color = useSelector(state => state.color)
  const leave = useSelector(state => state.leave)
  const classes = useStyles({color});


let question = useSelector(state=> state.question)

const [answer, setAnswer] = useState('')
  
  const dispatch = useDispatch()
  
  useEffect(() => {
    try{
    dispatch(actions.requestPrompt(roomID, socket, history))
    }
    catch(err){
      dispatch({type: 'RESET_USER'})
      history.push('/')
    }

},[]);

window.onbeforeunload = function() {

  socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
dispatch({type: 'RESET_USER'})
history.push('/')
}

window.addEventListener("pagehide" , function (event) { 
  socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
dispatch({type: 'RESET_USER'})
history.push('/')
} );

const submitAnswer = (event) => {
  dispatch(actions.submitAnswer(roomID, name, answer, socket, question))
  history.push('/Answers', {name: name, room: roomID, answer: answer, question: question})
}

// function stop(event)
// {
//     socket.emit('remove_user', {roomID: roomID, name: name, part: 'questions'})
//     dispatch({type: 'RESET_USER'})
//     history.push('/')
//   // }
// } 


  return (
<Grid 
  container
  direction="column"
  alignItems="center"
  justify="center"
  style={{ minHeight: '90vh' }}>
    <Typography id="room">RoomID: {roomID}</Typography>
      <Card id="card-question">
      <Grid container alignItems="center" direction="column">
        <CardContent>
          <div id="question-div">
            <Typography id="question">{question}</Typography>
          </div> 
          <Grid item justify="center">
            <InputBase
              multiline
              id="answer-box"
              rows={10}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              inputProps={{maxLength :120}}
            />
           </Grid>
        </CardContent>
        <div id="submit-button-div">
          {answer.length > 0 ? <Button id="submit-button" variant="outlined" className={classes.Button} onClick={submitAnswer}>Submit</Button>
          : <Button id="submit-button" variant="outlined" className={classes.Button} disabled onClick={submitAnswer}>Submit</Button>}
          </div>
        </Grid>
      </Card>
      {leave ? <Alert id="leaving-alert" severity="error">You are the last person. Leaving room.</Alert> : null}
  </Grid>
  );
}

export default Game;




