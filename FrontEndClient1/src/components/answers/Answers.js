import React, {useState, useEffect, useRef} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import {
 Divider, List, ListItem
} from '@material-ui/core';

 import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../store/actions'
import { useHistory } from "react-router-dom";

import Slide from '@material-ui/core/Slide';
import './Answer.css';
import InputBase from '@material-ui/core/InputBase';
import MuiAlert from '@material-ui/lab/Alert';
let  color, secondaryColor;

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  Button: {
    "&:hover": {
      backgroundColor: ({ color}) => `${color}`
    },
    borderColor: ({color}) => `${(color)}`
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Answers = (props) => {
  color = useSelector(state => state.color)
  secondaryColor = useSelector(state => state.secondaryColor)
  const classes = useStyles({color,secondaryColor});
  //Access redux state tree:
  let socket = useSelector(state => state.socket)
  let roomID = useSelector(state => state.roomID)
  let name = useSelector(state => state.name)
  let question = useSelector(state => state.question)
  let userID = useSelector(state => state.userID)
  const leave = useSelector(state => state.leave)

  const [display, setDisplay] = useState(false);
  const [slide, setSlide] = useState(false);
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch()
  const [ID, setID] = useState([]);
  const [answers, setAnswers] = useState([])
  const [choice, setChoice] = useState(false);
  const [renderPoints, setrenderPoints] = useState(false)
  const [points, setPoints] = useState([])//place in redux so we can dd animation of number increasing
  const [player, setPlayers] = useState([]);
  const [useranswer, setuserAnswers] = useState([]);
  const [exit, setExit] = useState(false);
  const [clicked, setClicked] = useState(false)
  const rootRef = useRef(null);
  let history = useHistory();

  useEffect(() => {
    if(renderPoints){
      dispatch({type: 'SET_PAGE', payload: 'points'})
    }
  }, [])



  useEffect(() => {
    try{
    socket.on('displayAnswers', (answerInfo) => {
      let answer = answerInfo.answerInfo.map(({answer}) => answer)
      let id = answerInfo.answerInfo.map(({id}) => id) 
      setAnswers(answer)
      setID(id)
      setDisplay(true)
      setSlide(true)
    })
  }
  catch(err){
    history.push('/')
  }
  })

  useEffect(() => {
    try{
    socket.on('start', (start) => {
      history.push('/Question', {name: name, room: roomID})
    })
    }
    catch(err){
      history.push('/')
    }
  })

  useEffect(() => {
    try{
    socket.on('displayPoints', (choiceInfo) => {
      dispatch({type: 'PASS_SCREEN'})
      if(renderPoints === false)
      {
        let players = choiceInfo.choiceInfo.map(({name}) => name)
        let points = choiceInfo.choiceInfo.map(({points}) => points) 
        let answer = choiceInfo.choiceInfo.map(({answer}) => answer) 
        let exit = choiceInfo.choiceInfo[0].exit
        setPlayers(players)
        setPoints(points)
        setuserAnswers(answer)
        dispatch({type: 'SET_FINAL_SCORES', payload: {player: players, points: points}})
        setrenderPoints(true)
        setExit(exit)
      }
      // history.push('/Game', {name: name, room: room})
    })
  }
  catch(err){
    history.push('/')
  }
  })

//   window.onbeforeunload = function() {
//     if(renderPoints){
//       socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
//     }
//     else{
//       socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
//     }
//   dispatch({type: 'RESET_USER'})
//   history.push('/')
// }

// window.addEventListener("pagehide" , function (event) { 
//   if(renderPoints){
//     socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
//   }
//   else{
//     socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
//   }
// dispatch({type: 'RESET_USER'})
// history.push('/')
// } );



  const chooseAnswer = (index) => {
      setOpen(true)
      dispatch(actions.chooseAnswer(roomID, ID[index], socket))
      setChoice(true)
  }

  const checkValidAnswer = (index) => {
    if(ID[index] === userID){
      return false
    }
    else{
      return true
    }
  }

  const movePage = () => {
    if(!exit){
    setOpen(true)
    setClicked(true)
    dispatch(actions.nextQuestion(roomID, socket, name, history, () => {
      history.push('/Question')
    }))
  }
  else{
    //CHECK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // socket.emit('remove_user', {roomID: roomID, name: name, part: 'waiting'})
    // dispatch({type: 'RESET_USER'})
    history.push('/Final')
  }
  }

  // const renderSentence = (player, points) => {
  //   return(
  //     `${player} has ${points} points`
  //   )
  // }

if(renderPoints)
{
  return (
    <Grid 
    container
    direction="column"
    alignItems="center"
    justify="center"
    style={{ minHeight: '90vh' }}>
      <Typography id="room">RoomID: {roomID}</Typography>
      <Slide direction="up" in={slide} mountOnEnter unmountOnExit>
        <Card id="card-answer">
          <CardContent>
            <Typography id="score-title">Scores</Typography>
            <List id="scroll" style={{overflow: 'auto', height: 300}}>
              {player.map((item, i) => (
                
                <Grid container direction="column">
                  <ListItem key={i}>
                    <div id="all-info">
                      <div id="player-info">
                        <Typography id="player">{item}</Typography>
                        <Typography id="answer">{useranswer[i]}</Typography>
                      </div>
                      <div id="points-div">
                        <Typography id="points">{points[i]}</Typography>
                      </div>
                    </div>
                    
                </ListItem>
                <Divider component="li" variant="middle" className="line"/>
                </Grid>
                ))}
            </List>
          </CardContent>
          <div id="button-div">
          {exit ? <Button id="bottom-buttons" type="secondary" variant="outlined" className={classes.Button}
                          onClick={movePage} >Who won?</Button> : 
                  <Button id="bottom-buttons" type="secondary" variant="outlined" className={classes.Button}
                          onClick={movePage} disabled={clicked} >Next question</Button>}
                          </div>
        </Card>
        </Slide>
    </Grid>
  );
}
else
{
  // setSlide(true)
  return(
    <Grid 
  container
  direction="column"
  alignItems="center"
  justify="center"
  style={{ minHeight: '90vh' }}>
    <Typography id="room">RoomID: {roomID}</Typography>
    {display ? 
    <Grid container alignItems="center" direction="column">
      <Card id="card-answer">
      <CardContent>
        <Typography id="question">{question}</Typography>
        <List id="scroll" style={{overflow: 'auto', height: 300}}>
          {answers.map((item, i) => (
              <ListItem key={i}>
                 <Slide direction="up" in={slide} mountOnEnter unmountOnExit>
                    <Grid contanier jusitfy="flex-start" alignItem="flex-start">
                    {!choice && checkValidAnswer(i) ? 
                      <Button className={classes.Button} onClick={() => chooseAnswer(i)} 
                              id="choice-buttons" variant="outlined"
                              type="secondary" >{item}</Button> 
                    : <Button id="choice-buttons" variant="outlined" type="secondary" disabled
                              className={classes.Button}>{item}</Button>}
                    </Grid>
                  </Slide>
              </ListItem>
            ))}
        </List>
      </CardContent>
      </Card>
      </Grid> :
      <Grid container alignItems="center" direction="column">
        <Card id="card-question">
        <CardContent>
        <div id="question-div">
            <Typography id="question">{question}</Typography>
          </div> 
            <InputBase
              editable={false}
              multiline
              id="waiting-box"
              rows={10}
              inputProps={{maxLength :0}}
              value="Waiting for Answers..."
              readOnly={true}
            />
        </CardContent>
        </Card>
        </Grid>
      }
      {leave ? <Alert id="leaving-alert" severity="error">You are the last person. Leaving room.</Alert> : null}
  </Grid>
  )
}

}

export default Answers;
