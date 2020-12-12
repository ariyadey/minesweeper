import React from "react";
import logo from "./asset/logo.svg";

export default Minesweeper;

//todo
function Minesweeper() {
    return <div className={"minesweeper"}>
        <ControlPanel/>
        <Field/>
    </div>;
}

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

//todo Should it know its row number?
function Row(props) {
    return <div className={"row"}>
        {props.rowArr.map((element, index) =>
            <Cell
                key={`r${props.rowNum}_c${index}`}
                value={element}
            />)}
    </div>;
}

function Cell(props) {
    return <button className={"cell"}>
        {props.value}
    </button>;
}

function ControlPanel() {
    return <div className={"control-panel"}>
        <LogoPanel/>
        <StatusPanel/>
    </div>;
}

function LogoPanel() {
    return <div className={"logo-panel"}>
        <p className={"app-name"}>Minesweeper</p>
        <img src={logo} className="app-logo" alt="logo" />
    </div>;
}

function StatusPanel() {
    return <div className={"statusPanel"}>
        <FlagsCounter/>
        <button className={"reset"}>Reset</button>
        <Timer/>
    </div>;
}

//todo consider merging this method with timer
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
