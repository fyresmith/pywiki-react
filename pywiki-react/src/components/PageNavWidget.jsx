import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import "./css/NavigationStack.css";
import { getTheme, setGlobalTheme } from "../utils/utils";

function PageNavWidget({ userData }) {
    const [themeBtn, setThemeBtn] = useState("Light Mode");
    const root = document.documentElement;
    
    function setThemeColors() {
        if (getTheme() === "dark") {
            root.style.setProperty("--navLink-hover-bg-color", "#2f3239");
            root.style.setProperty("--navLink-active-bg-color", "#393d44");
        } else {
            root.style.setProperty("--navLink-hover-bg-color", "#ededed");
            root.style.setProperty("--navLink-active-bg-color", "#dedede");
        }
    }

    function formatString(inputString) {
        const lowercaseString = inputString.toLowerCase();
        const formattedString = lowercaseString.replace(/\s+/g, '-');
        return formattedString;
    }

    function toEditor() {
        const finalSegment = window.location.href.split('/').pop();
        window.location.href = "/editor/" + finalSegment;
    }

    function logoutUser() {
        console.log("Logging out...");

        fetch("/api/log-out", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // You can include any data if needed
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Logout successful:", data);
                window.location.href = "/";
            })
            .catch((error) => {
                console.error(
                    "There was a problem with the fetch operation:",
                    error
                );
            });
    }

    function homePage() {
        window.location.href = "/";
    }

    function toggleDarkMode() {
        if (getTheme() === "dark") {
            setGlobalTheme("light");
            setThemeBtn("Dark Mode");
            setThemeColors();
        } else {
            setGlobalTheme("dark");
            setThemeBtn("Light Mode");
            setThemeColors();
        }
    }

    setThemeColors();

    if (userData.role === 'viewer') {
        return (
            <Card className="primary">
                <Card.Header as="h3" className='text-center' style={{paddingRight: '20px',}}>The Riveon Wiki</Card.Header>
                <Card.Body>
                    <div className="navLink" onClick={homePage}>
                        <i class="fas fa-list"></i>&nbsp;&nbsp;&nbsp;Page Library
                    </div>
                    {/* <div className="navLink">
                        <i class="fas fa-comments"></i>&nbsp;&nbsp;&nbsp;Comments
                    </div>
                    <div className="navLink" onClick={toggleDarkMode}>
                        <i class="fas fa-adjust"></i>&nbsp;&nbsp;&nbsp;{themeBtn}
                    </div> */}
                    <div className="navLink text-danger" onClick={logoutUser}>
                        <i class="fas fa-sign-out-alt"></i>&nbsp;&nbsp;&nbsp;Log Out
                    </div>
                </Card.Body>
                <Card.Footer className="text-muted text-center">Signed in as Caleb</Card.Footer>
            </Card>
        );
    } else {
        return (
            <Card className="primary">
                <Card.Header as="h3" className='text-center' style={{paddingRight: '20px',}}>The Riveon Wiki</Card.Header>
                <Card.Body>
                    <div className="navLink" onClick={homePage}>
                        <i class="fas fa-list"></i>&nbsp;&nbsp;&nbsp;Page Library
                    </div>
                    <div className="navLink" onClick={toEditor}>
                        <i class="fas fa-edit"></i>&nbsp;&nbsp;&nbsp;Edit Page
                    </div>
                    {/* <div className="navLink">
                        <i class="fas fa-comments"></i>&nbsp;&nbsp;&nbsp;Comments
                    </div> */}
                    {/* <div className="navLink" onClick={toggleDarkMode}> */}
                        {/* <i class="fas fa-adjust"></i>&nbsp;&nbsp;&nbsp;{themeBtn} */}
                    {/* </div> */}
                    <div className="navLink text-danger" onClick={logoutUser}>
                        <i class="fas fa-sign-out-alt"></i>&nbsp;&nbsp;&nbsp;Log Out
                    </div>
                </Card.Body>
                <Card.Footer className="text-muted text-center">Signed in as {userData.first_name}</Card.Footer>
            </Card>
        );
    }
}

export default PageNavWidget;
