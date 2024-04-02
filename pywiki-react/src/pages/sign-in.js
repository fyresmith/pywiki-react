import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { API_BASE_URL } from "../utils/utils.js";

const SignIn = () => {
    const cardStyle = {
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
        email: "",
        password: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const email = formData.email;

            const response = await fetch(API_BASE_URL + "/sign-in", {
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
                console.log(data.data.user);
                localStorage.setItem('emailAddress', email)
                window.location.href = '/verify';
            } else {
                console.log("Invalid Credentials!");
                setErrorMessage("Invalid Username or Password!");
            }
        } catch (error) {
            setErrorMessage("There was a problem signing in...");
            console.error(
                "There was a problem with the fetch operation:",
                error
            );
            return null;
        }
    };

    return (
        <Card style={cardStyle}>
            <Card.Header as="h3">Sign In</Card.Header>
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
                    <FloatingLabel
                        controlId="floatingInput"
                        label="Email address"
                        className="mb-3"
                    >
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </FloatingLabel>
                    <FloatingLabel
                        controlId="floatingPassword"
                        label="Password"
                    >
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </FloatingLabel>

                    <div className="d-grid mt-3">
                        <Button variant="outline-secondary" size="sm" type="submit">
                            Sign In
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default SignIn;
