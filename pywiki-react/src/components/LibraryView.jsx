import React, { useState, useEffect } from "react";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ExamplePage from "./ExamplePage";
import ListGroup from 'react-bootstrap/ListGroup';
import './css/LibraryView.css'

import { API_BASE_URL } from "../utils/utils";

function LibraryView({ userData }) {
    const [cards, setCards] = useState([]);
    const stack = {
        marginTop: "10px",
        marginBottom: "10px",
        display: "flex",
        flexWrap: "wrap",
    };

    function formatString(inputString) {
        const lowercaseString = inputString.toLowerCase();
        const formattedString = lowercaseString.replace(/\s+/g, '-');
        return formattedString;
    }

    function toPage(pageName) {
        window.location.href = "/page/" + pageName;
    }

    useEffect(() => {
        const loadPages = async () => {
            try {
                const response = await fetch(API_BASE_URL + "/pages", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                }

                const data = await response.json();
                console.log(data);

                if (data.success) {
                    console.log("Pages retrieved.");
                    const newCards = [];

                    // Iterate over each key-value pair in 'pages'
                    Object.entries(data.data.pages).forEach(([key, value]) => {
                        // Create a card for each key-value pair
                        let finalKey = key;
                        
                        if (key === "") {
                          finalKey = 'Uncategorized';
                        } 

                        const card = (
                            <Card key={finalKey} className="mb-3">
                                <Card.Header style={{ textAlign: 'center', fontWeight: '700', fontSize: '18px' }}>{finalKey}</Card.Header>
                                <Card.Body className="listGroup">
                                    <ListGroup className="list-group-flush">
                                        {value.map((item, index) => (
                                            <ListGroup.Item className="listItem" onClick={() => toPage(formatString(item))}>{item}</ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    {/* <ul>
                                        {value.map((item, index) => (
                                            // <li key={index}><a href={`/page/${formatString(item)}`}>{item}</a></li>
                                            <li key={index}><a href={`/page/${formatString(item)}`}>{item}</a></li>
                                        ))}
                                    </ul> */}
                                </Card.Body>
                            </Card>
                        );

                        newCards.push(card);
                    });

                    // Update the state with the new cards array
                    setCards(newCards);
                } else {
                    console.log("There was an error retrieving the pages.");
                }
            } catch (error) {
                console.error(
                    "There was a problem with the fetch operation:",
                    error
                );
            }
        };

        loadPages(); // Call the loadPages function when the component mounts
    }, []);

    function toCreate() {
        window.location.href = '/create';
    }

    if (userData.role !== 'admin' && userData.role !== 'editor') {
        return (
            <Stack style={stack} gap={3}>
                <Card>
                    <Card.Header as="h3" className='text-center'>Page Library</Card.Header>
                    <Card.Body>
                        <Row xs={1} md={2} lg={2} className="g-4">
                            <Col>{cards.slice(0, Math.ceil(cards.length / 2))}</Col>
                            <Col>{cards.slice(Math.ceil(cards.length / 2))}</Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Stack>
        );
    } else {
        return (
            <Stack style={stack} gap={3}>
                <Card>
                    <Card.Header as="h3" className='text-center'>Page Library</Card.Header>
                    <Card.Body>
                        <div className="d-grid gap-2 mb-3">
                            <Button variant="outline-secondary" size="md" onClick={ toCreate }>
                                Create New Page
                            </Button>
                        </div>
                        <Row xs={1} md={2} lg={2} className="g-4">
                            <Col>{cards.slice(0, Math.ceil(cards.length / 2))}</Col>
                            <Col>{cards.slice(Math.ceil(cards.length / 2))}</Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Stack>
        );
    }
}

export default LibraryView;
