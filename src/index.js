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
            squares: Array(9).fill(null),
            xIsNext: true,
            highScores: [],
        })
    }
    renderSquare(i) {
        return <Square 
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
        />;
  }

    handleClick(i) {
        const squares = this.state.squares.slice();
        if(calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
          squares: squares,
          xIsNext: !this.state.xIsNext,
        });
      }

      componentDidMount() {
        this.fetchData()
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
          <li key={x._id}>Player {x.player} scores {x.score}</li>
        )
      }))
    }
    
  render() {
    const winner = calculateWinner(this.state.squares, this.props.name, this.props.timer, this.props.startTime);
    let status, elapsedTime;
    if (winner) {
        status = winner;
        elapsedTime = Math.floor((Date.now() - this.props.startTime)/1000)
        this.postData(this.props.name, elapsedTime)
    } else {
        status = " Next player: " + (this.state.xIsNext ? "X" : "O")
    }

    return (
      <div>
        <div className="status">{status}</div>
        {elapsedTime !== undefined && <p>{"Elapsed Time: " + elapsedTime + " seconds"}</p>}
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
        <ul><h3>Leaderboard</h3>
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
    }
  }

  responseGoogle = (response) => {
    this.setState({
      isLoggedIn: true,
      name: response.w3.ofa,
      startTime: Date.now(),
    })
  }

  render() {
    return (
      <div className="game">
        
        
        <div className="game-board">
          { this.state.isLoggedIn && 
          <div>
            <Board name={this.state.name} timer={this.state.timer} startTime={this.state.startTime} /> 
          <p>Player: {this.state.name}</p>
          </div> }
        </div>
        {this.state.isLoggedIn && 
          <div className="game-info">
            <div>{/* status */}</div>
            <ol>{/* TODO */}</ol>
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
          return "Winner is: " + squares[a];
        }
    }
    return null;
}

