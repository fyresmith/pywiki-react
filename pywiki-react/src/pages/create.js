import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { verifyUser, fetchUserData } from '../utils/utils.js';
import { setGlobalTheme, API_BASE_URL } from "../utils/utils.js";

const Create = () => {
    setGlobalTheme('dark');

    const [isUserVerified, setIsUserVerified] = useState(null);
    const [userData, setUserData] = useState(null);

    const cardStyle = {
        margin: "auto",
        marginTop: "100px",
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
        return <p>Loading...</p>;
    } else if (isUserVerified === true) {
        if (!userData) {
            return <p>Loading user data...</p>;
        }

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
        
            try {
                const pageName = formData.pageName;
        
                const response = await fetch(API_BASE_URL + "/create-page", {
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
                    window.location.href = '/';
                } else if (data.error.code === 422) {
                    console.log("Page name invalid!");
                    setErrorMessage("Page name is invalid!");
                } else {
                    console.log("Page already exists!");
                    setErrorMessage("Page already exists!");
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
                <Card.Header as="h3">Create New Page</Card.Header>
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
                                label="Page Name"
                                className="mb-3"
                            >
                                <Form.Control
                                    type="text"
                                    name="pageName"
                                    placeholder="Example..."
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
                                Create Page
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

export default Create;
