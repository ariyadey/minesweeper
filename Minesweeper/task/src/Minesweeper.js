//todo: Use react hooks

import React from "react";
import "./App.css";
import logo from "./asset/logo.svg";
import fired from "./asset/fired.svg";
import target from "./asset/target.svg";

export default class Minesweeper extends React.Component {
    constructor(props, context) {
        super(props, context);
        const rows = 9, columns = 8, mines = 10;
        this.state = {
            field: this.getRandomField(rows, columns, mines),
            status: {
                gameStarted: false,
                gameEnded: false,
            },
        }
    }

    render() {
        return <div className={"body"}>
            <div className={"main-block"}>
                <ControlPanel
                    remainedFlags={this.getRemainedFlags()}
                    status={this.state.status}
                />
                <Field
                    rowsArr={this.state.field}
                    onClick={(clickType, row, column) => this.handleClick(clickType, row, column)}
                />
            </div>
        </div>;
    }

    //todo: Optimize it
    getRandomField = (rows, columns, mines) => {
        const rowsArr = [...Array(rows)]
            .map(() => [...Array(columns)]
                .map(() => ({
                    opened: false,
                    flagged: false,
                    mine: false,
                })));
        let minesPut = 0;
        while (minesPut < mines) {
            const row = Math.floor(Math.random() * (rows));
            const column = Math.floor(Math.random() * (columns));
            if (!rowsArr[row][column].mine) {
                rowsArr[row][column].mine = true;
                minesPut++;
            }
        }
        return rowsArr;
    };

    //todo: Make the game more usable by modifying conditions
    handleClick = (clickType, row, column) => {
        const field = this.state.field.slice();
        const status = {...this.state.status};
        updateState();
        this.setState({
            field,
            status,
        });

        function updateState() {
            const cell = field[row][column];
            if (status.gameEnded || cell.opened) return;
            if (!status.gameStarted) status.gameStarted = true;
            if (clickType === "left") {
                cell.opened = true;
                cell.flagged = false;
                if (cell.mine) status.gameEnded = true;
            } else if (clickType === "right") cell.flagged = true;
        }
    };

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
            status={props.status}
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
        <button
            className={"reset"}>Reset
        </button>
        <Timer
            status={props.status}
        />
    </div>;
}

//todo: Consider merging this method with timer
function FlagsCounter(props) {
    return <p className={"flags-counter"}>
        {props.remainedFlags}
    </p>;
}

class Timer extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            startDate: null,
            timeElapsed: 0,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        //todo: Figure out why the following line of code is problematic
        // super.componentDidUpdate(prevProps, prevState);
        if (!this.props.status.gameEnded &&
            this.props.status.gameStarted &&
            !prevProps.status.gameStarted) {
            this.setState(({
                startDate: Date.now(),
            }));
            this.timerId = setInterval(this.updateTimeElapsed, 1000);
        }
        if (this.props.status.gameEnded) {
            clearInterval(this.timerId);
        }
    }

    render() {
        return <p className={"timer"}>
            {this.state.timeElapsed}
        </p>;
    }

    updateTimeElapsed = () => {
        this.setState((state) => ({
            timeElapsed: Math.floor((Date.now() - state.startDate) / 1000),
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
    const flagImage = <img className={"flag"} alt={"flag"} src={target}/>;
    const mineImage = <img className={"mine"} alt={"mine"} src={fired}/>;
    const openedClear = <div className={"opened-clear"}/>;

    let cellStatus = null;
    if (props.cell.opened) {
        if (props.cell.mine) {
            cellStatus = mineImage;
        } else {
            cellStatus = openedClear;
        }
    } else if (props.cell.flagged) {
        cellStatus = flagImage;
    }

    //todo: Use className and Id properly to pass the test
    return <button
        className={"cell"}
        onClick={() => props.onClick("left")}
        onContextMenu={(e) => {
            e.preventDefault();
            return props.onClick("right");
        }}
    >
        {cellStatus}
    </button>;
}