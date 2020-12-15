import React from "react";
import "./Minesweeper.css";
import logo from "./asset/logo.svg";
import fired from "./asset/fired.svg";
import target from "./asset/target.svg";

export default class Minesweeper extends React.Component {
    constructor(props, context) {
        super(props, context);
        const rows = 9, columns = 8, mines = 10;
        this.state = {
            field: this.getRandomField(rows, columns, mines),
        }
    }

    render() {
        return <div className={"minesweeper"}>
            <ControlPanel
                flagsNum={10}
                timeElapsed={"0:00"}
            />
            <Field
                rowsArr={this.state.field}
                onClick={(clickType, row, column) => this.handleClick(clickType, row, column)}
            />
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

    handleClick = (clickType, row, column) => {
        const field = this.state.field.slice();
        if (field.opened) return;    //Field has been opened before
        if (clickType === "left") {
            field[row][column] = {
                opened: true,
                flagged: false,
            }
        } else if (clickType === "right") {
            field[row][column] = {
                flagged: true,
            }
        }
        this.setState({
            field
        });
    };
}

function ControlPanel(props) {
    return <div className={"control-panel"}>
        <LogoPanel/>
        <StatusPanel
            flagsNum={props.flagsNum}
            timeElapsed={props.timeElapsed}
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
            flagsNum={props.flagsNum}
        />
        <button
            className={"reset"}>Reset
        </button>
        <Timer
            timeElapsed={props.timeElapsed}
        />
    </div>;
}

//todo: Consider merging this method with timer
function FlagsCounter(props) {
    return <p className={"flags-counter"}>
        {props.flagsNum}
    </p>;
}

function Timer(props) {
    return <p className={"timer"}>
        {props.timeElapsed}
    </p>;
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

    return <button
        className={"cell"}
        onClick={() => props.onClick("left")}
        onContextMenu={() => props.onClick("right")}
    >
        {/*todo: Ensure passing null isn't problematic*/}
        {cellStatus}
    </button>;
}