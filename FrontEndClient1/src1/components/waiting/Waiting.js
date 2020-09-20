import React, {useState, useEffect} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import {List} from '@material-ui/core';
 import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../store/actions'
import { useHistory } from "react-router-dom";
import Zoom from '@material-ui/core/Zoom';
import './waiting.css';
import MuiAlert from '@material-ui/lab/Alert';

let socket;
let color;

const useStyles = makeStyles({
  Button: {
    display: 'flex',
    flex: 1,
    alignContent: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    "&:hover": {
      backgroundColor: ({ color}) => `${color}`
    },
    borderRadius: 7,
    width: 120,
    borderWidth: 1,
    fontSize: 10,
    borderColor: ({color}) => `${(color)}`
  }, 
  card: {
    borderRadius: 40,
    height: 500,
    width: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
    zIndex: 300
  },
  bar: {
    alignSelf: 'center',
    fontColor: 'black',
    background: 'transparent'
  },
  test: {
    color: 'white',
    fontColor: 'black',
    background: 'black'
  },
  text: {
    padding: 5,
    width: 300,
    height: 50,
    fontSize: 25,
    borderColor: 'black',
    borderRadius: 10,
    borderWidth: 3,
    fontFamily: 'Segoe Print',
    backgroundColor: '#black',
    marginTop: 15,
    alignSelf: 'center'
  },
  test1: {
    color: 'black',
    flex: 1,
    marginLeft: 100,
    marginRight: 100,
    height: 45,
    width: 200,
    alignItems: 'center',
    fontSize: 20,
    fontFamily: 'Segoe Print',
    fontColor: 'white',
    jusitfyContent: 'center'
  }
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Waiting = (props) => {
  const classes = useStyles({color});
  let history = useHistory();
  //Access redux state tree:
  let members = useSelector(state=> state.members)
  let socket = useSelector(state=> state.socket)
  let roomID = useSelector(state => state.roomID)
  color = useSelector(state => state.color)
  let start = useSelector(state => state.start)
  let name = useSelector(state => state.name)
  const page = useSelector(state => state.page)
  let waiting = useSelector(state => state.waiting)
  const [slide, setSlide] = useState(false);
  const [ready, setReady] = useState(false)
  const leave = useSelector(state => state.leave)
    
  const dispatch = useDispatch()
  
  useEffect(() => {
    setSlide(true)
      
  },[]);

  window.addEventListener("pagehide" , function (event) { 
  dispatch({type: 'RESET_USER'})
  history.push('/')
} );

useEffect(() => {
  try{
    socket.on('disconnect', () => {
      setTimeout(
        function() {
          window.location.reload(true);
          dispatch({type: 'RESET_USER'});

          history.push('/');
        },5000);
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
      dispatch({type: 'LEAVE_PAGE'})
      console.log(leave)
      setTimeout(
        function() {
          window.location.reload(true);
          dispatch({type: 'RESET_USER'});

          history.push('/');
        },5000);
    }
  })

  useEffect(() => {
    try{
    socket.on('next_question', () => {
      history.push('/Question', {name: name, room: roomID})
    })
  }
  catch(err){
    dispatch({type: 'LEAVE_PAGE'})
    console.log(leave)
    setTimeout(
      function() {
        window.location.reload(true);
        dispatch({type: 'RESET_USER'});

        history.push('/');
      },5000);
  }
  })

  useEffect(() => {
    try{
    socket.on('return_home', () => {
      dispatch({type: 'LEAVE_PAGE'})
      console.log(leave)
      setTimeout(
        function() {
          window.location.reload(true);
          dispatch({type: 'RESET_USER'});

          history.push('/');
        },2000);
    })
  }
  catch(err){
    history.push('/')
  }
  })

  window.onbeforeunload = function() {

    socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
    dispatch({type: 'RESET_USER'})
    history.push('/')
}



  const startGame = () => { //used for creator
    if(!ready){
    setReady(true);
    dispatch(actions.startGame(roomID, name, socket, history, (update) => {
      history.push('/Question', {name: name, room: roomID})
    }))
  }
  }

  window.addEventListener("pagehide" , function (event) { 
    socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
  dispatch({type: 'RESET_USER'})
  history.push('/')
} );


window.onbeforeunload = function() {

    socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
  dispatch({type: 'RESET_USER'})
  history.push('/')
}
window.onpopstate = function() {
  socket.emit('remove_user', {roomID: roomID, name: name, part: '1'})
  dispatch({type: 'RESET_USER'})
  history.push('/')
}

// ifvisible.setIdleDuration(5);
// ifvisible.on("hidden", function(){
//   socket.emit('remove_user', {roomID: roomID, name: name, part: 'waiting'})
//   dispatch({type: 'RESET_USER'})
//   history.push('/')
// });
  return (
<Grid 
  container
  direction="column"
  alignItems="center"
  justify="center"
  style={{ minHeight: '90vh' }}>
    <Typography id="room">RoomID: {roomID}</Typography>
    <Zoom in={slide}>
      <Card id="card-waiting">
      <Grid container alignItems="center" justify="center" direction="column">
        <CardContent>
          {waiting ? <Typography id="waiting">Please wait till the next round</Typography> :<Typography id="waiting">Waiting for People to Join...</Typography>}
          <List id="scroll" style={{overflow: 'auto', height: 260, marginBottom: 10}}>
            {members != undefined ? members.map((item, i) => (
              <Slide direction="up" in={slide} mountOnEnter unmountOnExit>
                <Grid container alignItems="center" justify="center" >
                  <Typography id="person">{item}</Typography>
                </Grid>
              </Slide>
            )) : null}
          </List>
        </CardContent>
        <div id="submit-button">
          {!ready && !waiting && members && members.length > 1 ? <Button id="submit-button" variant="outlined" className={classes.Button} onClick={startGame}>Ready!</Button> 
                                                       : <Button id="submit-button" variant="outlined" disabled className={classes.Button} onClick={startGame}>Ready!</Button>}
          </div>
        </Grid>
      </Card>
      </Zoom>
      {leave ? <Alert id="leaving-alert" severity="error">You are the last person. Leaving room.</Alert> : null}
  </Grid>
  );
}

export default Waiting;