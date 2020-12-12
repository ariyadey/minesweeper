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

function ControlPanel() {
    return <div className={"control-panel"}>
        <BrandPanel/>
        <StatusPanel/>
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

function StatusPanel() {
    return <div className={"statusPanel"}>
        <FlagsCounter/>
        <Reset/>
        <Timer/>
    </div>
}

function BrandPanel() {
    return <div className={"logo-panel"}>
        <p className={"app-name"}>Minesweeper</p>
        <img src={logo} className="app-logo" alt="logo" />
    </div>;
}

function Cell(props) {
    return <button className={"cell"}>
        {props.value}
    </button>;
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

function FlagsCounter() {
}

function Reset() {
}

function Timer(props) {
    return <title>
        {props.timeElapsed}
    </title>
}
