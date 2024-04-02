import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import "./css/NavigationStack.css";
import { getTheme, setGlobalTheme, fetchUserData } from "../utils/utils";

function NavWidget({ userData }) {
    const [themeBtn, setThemeBtn] = useState("Light Mode");
    const root = document.documentElement;

    function setThemeColors() {
        if (getTheme() === "dark") {
            root.style.setProperty("--navLink-hover-bg-color", "#2f3239");
            root.style.setProperty("--navLink-active-bg-color", "#393d44");

            root.style.setProperty("--header-underline", "#fff");
            root.style.setProperty("--code-bg", "#2b3035");
            root.style.setProperty("--code-border", "#3f464d");
            root.style.setProperty("--code-color", "#dfdfdf");
            root.style.setProperty("--blockquote-border", "#888");
        } else {
            root.style.setProperty("--navLink-hover-bg-color", "#ededed");
            root.style.setProperty("--navLink-active-bg-color", "#dedede");

            root.style.setProperty("--header-underline", "#000");
            root.style.setProperty("--code-bg", "#f4f4f4");
            root.style.setProperty("--code-border", "#ddd");
            root.style.setProperty("--code-color", "#0a0a0a");
            root.style.setProperty("--blockquote-border", "#313131");
        }
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

    return (
        <div>
            <Card className="primary">
                <Card.Header as="h3" className='text-center' style={{paddingRight: '20px',}}>The Riveon Wiki</Card.Header>
                <Card.Body>
                    <div className="navLink" onClick={homePage}>
                        <i class="fas fa-list"></i>&nbsp;&nbsp;&nbsp;Page
                        Library
                    </div>
                    {/* <div className="navLink">
                        <i class="fas fa-users"></i>&nbsp;&nbsp;&nbsp;Users
                    </div> */}
                    {/* <div className="navLink">
                        <i class="fas fa-adjust"></i>&nbsp;&nbsp;&nbsp;{themeBtn}
                    </div> */}
                    <div className="navLink text-danger" onClick={logoutUser}>
                        <i class="fas fa-sign-out-alt"></i>&nbsp;&nbsp;&nbsp;Log
                        Out
                    </div>
                </Card.Body>
                <Card.Footer className="text-muted text-center">
                    Signed in as {userData.first_name}
                </Card.Footer>
            </Card>
        </div>
    );
}

export default NavWidget;
