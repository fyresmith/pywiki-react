import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { verifyUser, fetchUserData, toastFailure } from '../utils/utils.js';
import { API_BASE_URL } from "../utils/utils.js";
import { useParams } from 'react-router-dom';

const Delete = () => {
    let { pageName } = useParams();
    const [isUserVerified, setIsUserVerified] = useState(null);
    const [userData, setUserData] = useState(null);
    const [serverPageName, setPageName] = useState(pageName);

    const cardStyle = {
        // width: '400px',
        margin: "auto", // Center horizontally
        marginTop: "100px", // Adjust vertical position as needed
        textAlign: "center",
    };

    const formStyle = {
        width: "400px",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
    };

    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        pageName: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            const verified = await verifyUser();
            setIsUserVerified(verified);

            try {
                const response = await fetch(API_BASE_URL + "/closest-page/" + pageName, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
        
                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                }
        
                const data = await response.json();
                console.log(data);
        
                if (data.success) {
                    console.log("Retrieved real page name!");
                    setPageName(data.data.page);
                } else {
                    console.log("Page does not exist!");
                    localStorage.setItem('errorMessage', 'Page does not exist!');
                    window.location.href = '/';
                }
            } catch (error) {
                setErrorMessage("There was an internal server error...");
                console.error(
                    "There was a problem with the fetch operation:",
                    error
                );
                return null;
            }
        };
        fetchData();

    }, []);

    useEffect(() => {
        const getUserData = async () => {
            if (isUserVerified === true) {
                const userData = await fetchUserData();
                setUserData(userData);
            }
        };
        getUserData();
    }, [isUserVerified]);

    if (isUserVerified === null) {
        // Loading state, you can render a loading spinner or message here
        return <p>Loading...</p>;
    } else if (isUserVerified === true) {
        if (!userData) {
            // User data is still being fetched, you can render a loading spinner or message here
            return <p>Loading user data...</p>;
        }

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
        
            try {
                formData.serverPageName = serverPageName;
                console.log(formData);
        
                const response = await fetch(API_BASE_URL + "/delete-page", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
        
                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                }
        
                const data = await response.json();
                console.log(data);
        
                if (data.success) {
                    console.log("Success!");
                    localStorage.setItem('successMessage', 'Page deleted!');
                    window.location.href = '/';
                } else {
                    console.log("Titles do not match!");
                    setErrorMessage("That page title does not match!");
                }
            } catch (error) {
                setErrorMessage("There was an internal server error...");
                console.error(
                    "There was a problem with the fetch operation:",
                    error
                );
                return null;
            }
        };        

        return (
            <Card style={cardStyle}>
                <Card.Header as="h3">Delete Page</Card.Header>
                <Card.Body>
                    <Card.Text>
                        {errorMessage && (
                            <div className="row text-center justify-content-center mb-3">
                                <div className="col-md-10">
                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {errorMessage}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card.Text>

                    <Form style={formStyle} onSubmit={handleSubmit}>
                        <>
                            <FloatingLabel
                                controlId="floatingInput"
                                label={`Retype "${serverPageName}"`}
                                className="mb-3"
                            >
                                <Form.Control
                                    type="text"
                                    name="pageName"
                                    placeholder="Delete Page..."
                                    value={formData.pageName}
                                    onChange={handleInputChange}
                                />
                            </FloatingLabel>
                        </>

                        <div className="d-grid mt-3">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleSubmit}
                            >
                                Delete Page
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        );
    } else {
        console.log("Redirecting user to sign-in page.");
        window.location.href = "/sign-in";
        return <p>Access Denied</p>;
    }
};

export default Delete;
