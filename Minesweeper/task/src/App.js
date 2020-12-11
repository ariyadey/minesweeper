import React from "react";
import "./App.css";

//todo
function Button(props) {
    return <button className={"cell"}>
        {props.value}
    </button>;
}

//todo
function Row(props) {
    return <div className={"row"}>
        {props.rowArr.map((element, index) =>
            <Button
                key={`r${props.rowNum}_c${index}`}
                value={element}
            />)}
    </div>;
}

//todo
function Field(props) {
    return <div className={"field"}>
        {props.rowsArr.map((rowArr, rowNum) =>
            <Row
                key={rowNum}
                rowNum={rowNum}
                rowArr={rowArr}
            />)}
    </div>;
}

//todo
class Minesweeper extends React.Component {
    constructor(props, context) {
        super(props, context);
        const rowSize = 9, colSize = 8;
        this.state = {
            boardMatrix: Array(rowSize).fill(Array(colSize).fill())
        }
    }

    render() {
        return <div className={"game"}>
            <Field
                rowsArr={this.state.boardMatrix}
            />
        </div>;
    }
}

function App() {
    return <Minesweeper/>;
    // render() {
    //     return <div className="App">
    //         <header className="App-header">
    //             <img src={logo} className="App-logo" alt="logo"/>
    //             <p>
    //                 Minesweeper is loading...
    //             </p>
    //             {/*<a*/}
    //             {/*  className="App-link"*/}
    //             {/*  href="https://reactjs.org"*/}
    //             {/*  target="_blank"*/}
    //             {/*  rel="noopener noreferrer"*/}
    //             {/*>*/}
    //             {/*  Learn React*/}
    //             {/*</a>*/}
    //         </header>
    //     </div>;
    // }
}

export default App;
