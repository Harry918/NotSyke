import React, {useState, useEffect} from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';
import CardFormat from './card-format/CardFormat'
import { Spring } from 'react-spring/renderprops'

let socket;

const useStyles = makeStyles({
  title: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const Home = ({location}) => {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [value, setValue] = React.useState(0);

  const classes = useStyles();
  const ENDPOINT = 'http://ec2-13-59-225-36.us-east-2.compute.amazonaws.com:5000/'


  //used for displaying the UI for the homepage depending on the create/join
  const displayPrompt = (value) =>
  {
    if(value === 0)
    {
    return(
      <CardFormat
      value={value}
      handleChange={handleChange}
      buttonName={"Join Room"}
      name={name}
      setName={setName}
      room={room}
      setRoom={setRoom}/>
    )
  }
  else
  {
    return(
      <CardFormat
      value={value}
      handleChange={handleChange}
      buttonName={"Create Room"}
      name={name}
      setName={setName}
      room={room}
      setRoom={setRoom}/>
    )
  }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const canvasStyle = {
    width: '100%',
    height: '100%',
    position: 'fixed',
    top: '0',
    left: '0'
  };

  return (
    <div>
      <Spring
      from={{ transform: 'translate3d(0,-800px,0)' }}
      to={{ transform: 'translate3d(0,0px,0)' }}>
      {props => (
        <div style={props}>
        {displayPrompt(value)}
      </div>
      )}
      </Spring>
    </div>
  );
}

export default Home;
