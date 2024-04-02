import Card from 'react-bootstrap/Card';
import React, { useEffect, useState } from 'react';
import { getTheme } from '../utils/utils';

function RecentPagesWidget() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

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

    setThemeColors();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/recent-pages', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }

                const responseData = await response.json();
                console.log(responseData)
                setData(responseData);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    if (!data) {
        return <p>Loading...</p>;
    }

    // return (
    //     <div>
    //         <h1>User: {data.user.name}</h1>
    //         <ul>
    //             {data.pages.map(page => (
    //                 <li key={page.id}>{page.title}</li>
    //             ))}
    //         </ul>
    //     </div>
    // );

    function formatString(inputString) {
        const lowercaseString = inputString.toLowerCase();
        return lowercaseString.replace(/\s+/g, "-");
    }

    function toPage(page) {
        window.location.href = "/page/" + formatString(page);
    }

    return (
        <Card>
            <Card.Header>Recent Pages</Card.Header>
            <Card.Body>
                {data.data.pages.map(page => (
                    <div className="navLink" onClick={() => toPage(page.page)}>
                        {page.page} <br></br><p style={{ fontSize: '10px', marginBottom: '5px' }}>Edited by {page.editor} on {page.date}</p>
                    </div>
                    // <li key={page.id}>{page.title}</li>
                ))}
            </Card.Body>
        </Card>
    )
}

export default RecentPagesWidget;