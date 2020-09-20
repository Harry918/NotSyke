import React, {useEffect} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Waiting from './components/waiting/Waiting'
import Home from './components/home/Home'
import Question from './components/question/Question'
import Answers from './components/answers/Answers'
import Final from './components/final/Final'
import ReactGa from 'react-ga'

export default function App() {
  useEffect(() => {
    ReactGa.initialize('UA-176095432-1');
    ReactGa.pageview(window.location.pathname + window.location.search);
  }, []);
  return(
  <Router>
    <Route path="/" exact component={Home} />
    <Route path="/Waiting" component={Waiting} />
    <Route path="/Question" component={Question} />
    <Route path="/Answers" component={Answers} />
    <Route path="/Final" component={Final} />
  </Router>
  )
}
