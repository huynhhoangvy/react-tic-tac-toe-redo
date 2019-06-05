import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import GoogleLogin from 'react-google-login';


const Square = (props) => {
    return (
      <button 
      className="square"
      onClick={props.onClick}
      >
        {props.value}
      </button>
    )
}

class Board extends React.Component {
    constructor(props) {
      super(props)
      this.state = ({
        highScores: [],
      })
    }
    
    renderSquare(i) {
      return (
        <Square 
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      />
      );
  }

      componentDidMount() {
        this.fetchData()
      }
      
    async fetchData () {
      const url = "http://ftw-highscores.herokuapp.com/tictactoe-dev/";
      let response = await fetch(url);
      let data = await response.json();
      this.setState({
        highScores: data.items
      })
    }
    
    renderHighScore() {
      return (this.state.highScores.map( (x) => {
        return (
          <li key={x._id}>{x.player} scores {x.score} points.</li>
        )
      }))
    }
    
  render() {

    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
        <ul><h3>LOW SCORES</h3>
          {this.renderHighScore()}
        </ul>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      isLoggedIn: false,
      timer: 0,
      startTime: 0,
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
    }
  }

  responseGoogle = (response) => {
    this.setState({
      isLoggedIn: true,
      name: response.w3.ofa,
      startTime: Date.now(),
    })
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const currentHistory = history[history.length - 1]; 
    const squares = currentHistory.squares.slice();
    if(calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([{   
        squares: squares,          
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
    }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  postData = async (name, elapsedTime) => {
    let data = new URLSearchParams();
    data.append('player', name);
    data.append('score', 100 - elapsedTime);
    const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev`;
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data.toString(),
        json: true,
      }
    );
  }
  
  render() {
    const history = this.state.history;
    const currentHistory = history[this.state.stepNumber];
    const winner = calculateWinner(currentHistory.squares);

    const move  = history.map((step, move) => { // why move seems to equal index???
      const desc = move ? 
      "Go to move #" + move:
      "Go to move game start";
      
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status, elapsedTime;
    if (winner) {
      status = "Winner: " + winner;
      elapsedTime = "Elapsed time: " + Math.floor((Date.now() - this.state.startTime)/1000) + " seconds";
      this.postData(this.state.name, elapsedTime)
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          { this.state.isLoggedIn && 
          <div>
            <Board 
            name = {this.state.name} 
            timer = {this.state.timer} 
            startTime = {this.state.startTime}
            squares = {currentHistory.squares}
            onClick = {(i) => this.handleClick(i)} 
            /> 
          </div> }
        </div>
      {this.state.isLoggedIn && 
        <div className="game-info">
          <h1>Welcome to Tic Tac Toe, {this.state.name}</h1>
          <h3>{status}</h3>
          <h3>{elapsedTime}</h3>
          <ol>{move}</ol>
        </div>
        }
        {!this.state.isLoggedIn && 
        <GoogleLogin
          clientId="344739454450-js8adhd3b4cv0hvvfba9ee84v7ilatps.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={this.responseGoogle}
          onFailure={this.responseGoogle}
          cookiePolicy={'single_host_origin'}
        />
        }
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  if (squares.every(square => square !== null)) {
    return "DRAW"
  }
    const winCases = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6],
    ];
    for (let i = 0; i < winCases.length; i++) {
        const [a,b,c] = winCases[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return squares[a];
        }
    }
    return null;
}

