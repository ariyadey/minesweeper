//todo: Use react hooks

import React from "react";
import "./App.css";
import logo from "./asset/logo.svg";
import fired from "./asset/fired.svg";
import target from "./asset/target.svg";

//todo: Think about where to put the game attributes
export default class Minesweeper extends React.Component {
    #rows = 9;
    #columns = 8;
    #mines = 10;

    constructor(props, context) {
        super(props, context);
        this.state = {
            field: this.getRandomField(this.#rows, this.#columns, this.#mines),
            situation: {
                gameStarted: false,
                gameLost: false,
                gameWon: false,
            },
        }
    }

    render() {
        return <div className={"body"}>
            <div className={"main-block"}>
                <ControlPanel
                    remainedFlags={this.getRemainedFlags()}
                    situation={this.state.situation}
                    onResetClick={() => this.handleResetClick(this.#rows, this.#columns, this.#mines)}
                />
                <Field
                    rowsArr={this.state.field}
                    onClick={(clickType, row, column) => this.handleCellClick(clickType, row, column)}
                />
            </div>
        </div>;
    }

    //todo: Optimize it
    //todo: Refactor it
    getRandomField = (rows, columns, mines) => {
        const rowsArr = [...Array(rows)]
            .map(() => [...Array(columns)]
                .map(() => ({
                    opened: false,
                    flagged: false,
                    mined: false,
                    traversed: false,   //todo: WARNING! Watch out potential bugs
                    minesAround: 0,
                })));
        let minesPut = 0;
        while (minesPut < mines) {
            const row = Math.floor(Math.random() * (rows));
            const column = Math.floor(Math.random() * (columns));
            if (!rowsArr[row][column].mined) {
                rowsArr[row][column].mined = true;
                if (row > 0 && column > 0) rowsArr[row - 1][column - 1].minesAround++;
                if (row > 0) rowsArr[row - 1][column].minesAround++;
                if (row > 0 && column < rowsArr[0].length - 1) rowsArr[row - 1][column + 1].minesAround++;
                if (column > 0) rowsArr[row][column - 1].minesAround++;
                if (column < rowsArr[0].length - 1) rowsArr[row][column + 1].minesAround++;
                if (row < rowsArr.length - 1 && column > 0) rowsArr[row + 1][column - 1].minesAround++;
                if (row < rowsArr.length - 1) rowsArr[row + 1][column].minesAround++;
                if (row < rowsArr.length - 1 && column < rowsArr[0].length - 1) rowsArr[row + 1][column + 1].minesAround++;
                minesPut++;
            }
        }
        return rowsArr;
    };

    //todo: Make the game more usable by modifying conditions
    //todo: Refactor it
    handleCellClick = (clickType, row, column) => {
        // const field = this.state.field.slice(); //todo: WARNING! It's still a shallow copy
        const field = JSON.parse(JSON.stringify(this.state.field)); //todo: Test it
        const situation = {...this.state.situation};
        const cell = field[row][column];
        if (situation.gameWon || situation.gameLost || cell.opened) return;
        if (!situation.gameStarted) {
            if (clickType === "left" && cell.mined) {
                console.log(this.#rows, this.#columns, this.#mines);
                // return;
                return this.handleResetClick(this.#rows, this.#columns, this.#mines);
                // return this.handleCellClick(clickType, row, column);
            }
            situation.gameStarted = true;
        }
        if (clickType === "left") {
            cell.opened = true;
            cell.flagged = false;
            if (cell.mined) gameOver();
            else expandAround(row, column);
        } else if (clickType === "right" && this.getRemainedFlags() > 0) cell.flagged = true;
        if (isGameWon()) situation.gameWon = true; //todo: You can make it more concise

        this.setState({
            field,
            situation: situation,
        });

        function gameOver() {
            situation.gameLost = true;
            for (const row of field) {
                for (const cell of row) {
                    if (cell.mined) {
                        cell.flagged = false;
                        cell.opened = true;
                    }
                }
            }
        }

        function expandAround(r, c) {
            if (field[r][c].traversed) return;

            field[r][c].traversed = true;
            field[r][c].opened = true;

            if (field[r][c].minesAround === 0) {
                if (r > 0 && c > 0) expandAround(r - 1, c - 1);
                if (r > 0) expandAround(r - 1, c);
                if (r > 0 && c < field[0].length - 1) expandAround(r - 1, c + 1);
                if (c > 0) expandAround(r, c - 1);
                if (c < field[0].length - 1) expandAround(r, c + 1);
                if (r < field.length - 1 && c > 0) expandAround(r + 1, c - 1);
                if (r < field.length - 1) expandAround(r + 1, c);
                if (r < field.length - 1 && c < field[0].length - 1) expandAround(r + 1, c + 1);
            }
        }

        function isGameWon() {
            for (const row of field) {
                for (const cell of row) {
                    if (!cell.opened && !cell.flagged) {
                        return false;
                    }
                }
            }
            return true;
        }
    }

    handleResetClick = (rows, columns, mines) => {
        this.setState({
            field: this.getRandomField(rows, columns, mines),
            situation: {
                gameStarted: false,
                gameLost: false,
                gameWon: false,
            },
        });
    }

    getRemainedFlags = () => {
        let flags = 0;
        for (const row of this.state.field) {
            for (const element of row) {
                if (element.flagged) {
                    flags++;
                }
            }
        }
        //todo: The following line of code is hard-coded
        return flags <= 10 ? 10 - flags : 0;
    };
}

function ControlPanel(props) {
    return <div className={"control-panel"}>
        <LogoPanel/>
        <StatusPanel
            remainedFlags={props.remainedFlags}
            situation={props.situation}
            onResetClick={props.onResetClick}
        />
    </div>;
}

function LogoPanel() {
    return <div className={"logo-panel"}>
        <p className={"app-name"}>Minesweeper</p>
        <img src={logo} className="app-logo" alt="logo"/>
    </div>;
}

function StatusPanel(props) {
    return <div className={"status-panel"}>
        <FlagsCounter
            remainedFlags={props.remainedFlags}
        />
        <Reset
            situation={props.situation}
            onResetClick={props.onResetClick}
        />
        <Timer
            situation={props.situation}
        />
    </div>;
}

//todo: Consider merging this method with timer
function FlagsCounter(props) {
    return <p className={"flags-counter"}>
        {props.remainedFlags}
    </p>;
}

function Reset(props) {
    //todo: Replace with emojis
    //todo: Add emoji to guidance comments below
    // const gameNotStarted = "&#128566;", gameStarted = "&#128526;", gameLost = "&#128577;", gameWon = "&#128525;";
    const gameNotStarted = "Reset", gameStarted = ":)", gameLost = ":/", gameWon = ":))";

    let situation;
    if (!props.situation.gameStarted) situation = gameNotStarted;
    else if (props.situation.gameLost) situation = gameLost;
    else if (props.situation.gameWon) situation = gameWon;
    else if (props.situation.gameStarted) situation = gameStarted;

    return <button
        className={"reset"}
        onClick={props.onResetClick}
    >
        {situation}
    </button>
}

class Timer extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            startDate: null,
            secondsElapsed: "00",
            minutesElapsed: 0,
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //todo: Figure out why the following line of code is problematic
        // super.componentDidUpdate(prevProps, prevState);
        if (this.props.situation.gameStarted && !prevProps.situation.gameStarted) {
            this.setState(({
                startDate: Date.now(),
            }));
            this.timerId = setInterval(this.updateTimeElapsed, 1000);
        } else if (this.props.situation.gameWon || this.props.situation.gameLost) {
            clearInterval(this.timerId);
        } else if (
            !this.props.situation.gameStarted &&
            (prevProps.situation.gameStarted || prevProps.situation.gameWon || prevProps.situation.gameLost)) {

            clearInterval(this.timerId);
            this.setState({
                secondsElapsed: "00",
                minutesElapsed: 0,
            })
        }
    }

    render() {
        return <p className={"timer"}>
            {this.state.minutesElapsed}:{this.state.secondsElapsed}
        </p>;
    }

    updateTimeElapsed = () => {
        this.setState((state) => ({
            secondsElapsed: ("0" + Math.floor((Date.now() - state.startDate) / 1000 % 60)).slice(-2),
            minutesElapsed: Math.floor((Date.now() - state.startDate) / 1000 / 60),
        }));
    };
}

function Field(props) {
    return <div className={"field"}>
        {props.rowsArr.map((rowArr, rowNum) =>
            <Row
                key={rowNum}
                rowNum={rowNum}
                rowArr={rowArr}
                onClick={(clickType, column) => props.onClick(clickType, rowNum, column)}
            />)}
    </div>;
}

//todo: Consider removing Row and merge with Field
function Row(props) {
    return <div className={"row"}>
        {props.rowArr.map((element, index) =>
            <Cell
                key={`r${props.rowNum}_c${index}`}
                cell={element}
                onClick={(clickType) => props.onClick(clickType, index)}
            />)}
    </div>;
}

//todo: Consider handling the clicks on disabled cells right here
function Cell(props) {
    const unopened = <span className={"cell"} id={"unopened"}/>;
    const openedClear = <div
        className={"cell"}
        id={"opened-clear"}
    >
        {props.cell.minesAround > 0 && props.cell.minesAround}
    </div>;
    const flagImage = <img className={"cell"} id={"flag"} alt={"flag"} src={target}/>;
    const mineImage = <img className={"cell"} id={"mine"} alt={"mine"} src={fired}/>;

    let cellStatus;
    if (props.cell.opened) {
        if (props.cell.mined) {
            cellStatus = mineImage;
        } else {
            cellStatus = openedClear;
        }
    } else if (props.cell.flagged) {
        cellStatus = flagImage;
    } else {
        cellStatus = unopened;
    }

    //todo: Use className and Id properly to pass the test
    return <button
        className={"cell-container"}
        onClick={() => props.onClick("left")}
        onContextMenu={(e) => {
            e.preventDefault();
            return props.onClick("right");
        }}
    >
        {cellStatus}
    </button>;
}