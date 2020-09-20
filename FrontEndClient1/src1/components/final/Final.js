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
import { useHistory } from "react-router-dom";
import Confetti from 'react-dom-confetti';

import './Final.css';

let socket, color;

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  Button: {
    "&:hover": {
      backgroundColor: ({ color}) => `${color}`
    },

    // borderColor: ({color}) => `${(color)}`,


  }, 
}));

const Final = (props) => {
  color = useSelector(state => state.color)
  const classes = useStyles({color});
  //Access redux state tree:
  let test = useSelector(state => state)
  // let members = useSelector(state => state.members)
  let creator = useSelector(state => state.creator)
  let socket = useSelector(state => state.socket)
  let roomID = useSelector(state => state.roomID)
  let loading = useSelector(state => state.loading)
  let name = useSelector(state => state.name)
  let answer = useSelector(state => state.answer)
  let question = useSelector(state => state.question)
  let userID = useSelector(state => state.userID)
  let players = useSelector(state => state.members)
  let history = useHistory();
  let points = useSelector(state => state.points);
  let [finalArray, setFinalArray] = useState([]);

  // if(players == undefined || players.length < 1){
  //   history.push('/')
  // }
  const [slide, setSlide] = useState(false);
  const [open, setOpen] = useState(false);
  const [winners, setWinners] = useState([]); // change the winners name to players
  const[render, setRender] = useState(false)
  
  const dispatch = useDispatch()
  // useEffect(() => {
  //   findWinners()
  // })

  window.addEventListener("pagehide" , function (event) { 
    socket.emit('remove_user', {roomID: roomID, name: name, part: 'waiting'})
  dispatch({type: 'RESET_USER'})
  history.push('/')
} );


  window.onbeforeunload = function() {

    socket.emit('remove_user', {roomID: roomID, name: name, part: 'exit'})
    dispatch({type: 'RESET_USER'})
    history.push('/')
}

    const exitPage = () => {
        socket.emit('remove_user', {roomID: roomID, name: name, part: 'exit'})
        dispatch({type: 'RESET_USER'})
        history.push('/')
    }
    useEffect(() => {
      if(players.length === 0){
        history.push('/')
      }
      let retArray = [];
      let winners = [];
      let losers = [];
      while (players.length !== 0) {
        let obj = {};
        obj.player = players.shift();
        if(obj.player === name){
          setRender(true)
        }
        obj.points = points.shift();
        winners.push(obj);
        if (points[0] < winners[0].points) {
          while (players.length !== 0) {
            let obj = {};
            obj.player = players.shift();
            obj.points = points.shift();
            losers.push(obj);
          }
          retArray[1] = losers;
          break;
        }
      }
      retArray[0] = winners;
      setFinalArray(retArray)
    
  }, [])

    window.onbeforeunload = function() {
      socket.emit('remove_user', {roomID: roomID, name: name, part: 'end'})
      dispatch({type: 'RESET_USER'})
      history.push('/')
    }
    window.onpopstate = function() {
      socket.emit('remove_user', {roomID: roomID, name: name, part: 'end'})
      dispatch({type: 'RESET_USER'})
      history.push('/')
    }
    const movePage = () => {
      setOpen(true)
      dispatch({type: 'RESET_USER'})
      socket.emit('remove_user', {roomID: roomID, name: name, part: 'end'})
      history.push('/')
    }
    const config = {
      angle: 90,
      spread: "50",
      startVelocity: 40,
      elementCount: 70,
      dragFriction: 0.12,
      duration: 5000,
      stagger: 3,
      width: "10px",
      height: "10px",
      perspective: "1000px",
      colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
    };

    return(
        <Grid 
        container
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '90vh' }}>
          
        <Confetti active={render} config={config}/>
          <Typography id="room">RoomID: {roomID}</Typography>
            <Card id="card-final">
            <Grid container alignItems="center" direction="column">
              <CardContent >
                  <Typography id="winner-title">The Winner is... </Typography>
                  <List id="scroll" style={{overflow: 'auto', height: 300}}>
                  {finalArray[0] ? finalArray[0].map((item, i) => (
                      <ListItem key={i}>
                        <div id="winner-info-final">
                          <Typography id="winner-final">{item.player}</Typography>
                          <Typography id="winner-final">{item.points}</Typography>
                        </div>
                      </ListItem>
                      )): null}
                      <Divider component="li" variant="middle" className="line"/>
                    {finalArray[1] ? finalArray[1].map((item, i) => (
                        <ListItem key={i}>
                          <div id="loser-info-final">
                            <Typography id="loser-final">{item.player}</Typography>
                            <Typography id="loser-final">{item.points}</Typography>
                          </div>
                      </ListItem>
                      )): null}
                  </List>
              </CardContent>
              <Button id="exit-button" type="secondary" variant="outlined" className={classes.Button} onClick={movePage}>Exit</Button>
              </Grid>
            </Card>
        </Grid>
      )

}



export default Final