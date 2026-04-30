import { useState } from "react";
import { TopBar, StatusBadge } from "../components/Mini.jsx";
export default function Files( {OnSelect, OnMenuClick} ){
    return (
        <div className="page-wrap">
            <TopBar title="Files" onMenuClick={OnMenuClick}/>
        </div>
    )
}