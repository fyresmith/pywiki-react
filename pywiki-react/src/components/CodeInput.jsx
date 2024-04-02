import React, { useEffect, useRef, useReducer, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import "./css/CodeInput.css";
import { API_BASE_URL } from "../utils/utils";
import { useLocation } from "react-router-dom";

function doSubmit(submittedValues) {
    console.log(`Submitted: ${submittedValues.join("")}`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1500);
    });
}

function clampIndex(index) {
    if (index > 6) {
        return 6;
    } else if (index < 0) {
        return 0;
    } else {
        return index;
    }
}

function reducer(state, action) {
    switch (action.type) {
        case "INPUT":
            return {
                ...state,
                inputValues: [
                    ...state.inputValues.slice(0, action.payload.index),
                    action.payload.value,
                    ...state.inputValues.slice(action.payload.index + 1),
                ],
                focusedIndex: clampIndex(state.focusedIndex + 1),
            };

        case "BACK":
            return {
                ...state,
                focusedIndex: clampIndex(state.focusedIndex - 1),
            };

        case "PASTE":
            return {
                ...state,
                inputValues: state.inputValues.map(
                    (_, index) => action.payload.pastedValue[index] || ""
                ),
            };

        case "FOCUS":
            return {
                ...state,
                focusedIndex: action.payload.focusedIndex,
            };

        case "VERIFY":
            return {
                ...state,
                status: "pending",
            };

        case "VERIFY_UNLOCK":
            return {
                ...state,
                status: "idle",
            };

        default:
            throw new Error("unknown action");
    }
}

const initialState = {
    inputValues: Array(6).fill(""),
    focusedIndex: 0,
    status: "idle",
};

export default function CodeInput() {
    const location = useLocation();
    // const searchParams = new URLSearchParams(location.search);
    // const email = searchParams.get("email");
    const email = localStorage.getItem('emailAddress');

    const [errorMessage, setErrorMessage] = useState("");
    const [{ inputValues, focusedIndex, status }, dispatch] = useReducer(
        reducer,
        initialState
    );
    // console.log(focusedIndex);

    function handleInput(index, value) {
        dispatch({ type: "INPUT", payload: { index, value } });
    }

    function handleBack() {
        dispatch({ type: "BACK" });
    }

    function handleFocus(focusedIndex) {
        dispatch({ type: "FOCUS", payload: { focusedIndex } });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        dispatch({ type: "VERIFY" });

        try {
            console.log(email)
            const response = await fetch(API_BASE_URL + "/verify-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: inputValues.join(""),
                    email: email,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            const data = await response.json();
            console.log(data);

            if (data.success) {
                console.log("Verification successful. Redirecting to /");
                setErrorMessage("");
                window.location.href = "/"; // Redirect to '/'
            } else {
                console.log("Verification code is incorrect.");
                setErrorMessage("Verification failed. Code is incorrect.");
                dispatch({ type: "VERIFY_UNLOCK" });
            }
        } catch (error) {
            setErrorMessage("There was a problem with the server.");
            console.error(
                "There was a problem with the fetch operation:",
                error
            );
            dispatch({ type: "VERIFY_UNLOCK" });
        }
    };

    function handlePaste(pastedValue) {
        dispatch({ type: "PASTE", payload: { pastedValue } });
    }

    return (
        <Card>
            <Card.Header as="h3" style={{ textAlign: "center" }}>
                Enter Code
            </Card.Header>
            <Card.Text
                className="text-success fw-bold"
                style={{
                    textAlign: "center",
                    marginTop: "15px",
                    marginBottom: "20px",
                }}
            >
                We sent a code to your email.
            </Card.Text>

            {errorMessage && (
                <div className="row text-center justify-content-center mb-3">
                    <div className="col-md-10">
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="inputs">
                    {inputValues.map((value, index) => {
                        return (
                            <Input
                                key={index}
                                index={index}
                                value={value}
                                onChange={handleInput}
                                onBackspace={handleBack}
                                onPaste={handlePaste}
                                isFocused={index === focusedIndex}
                                onFocus={handleFocus}
                                isDisabled={status === "pending"}
                            />
                        );
                    })}
                </div>
                <Button
                    variant="outline-secondary"
                    disabled={status === "pending"}
                    type="submit"
                >
                    {status === "pending" ? "Verifying..." : "Verify"}
                </Button>
            </form>
        </Card>
    );
}

function Input({
    index,
    value,
    onChange,
    onPaste,
    onBackspace,
    isFocused,
    onFocus,
    isDisabled,
}) {
    const ref = useRef();
    useEffect(() => {
        requestAnimationFrame(() => {
            // console.log(
            //   ref.current,
            //   document.activeElement,
            //   ref.current !== document.activeElement
            // );
            if (ref.current !== document.activeElement && isFocused) {
                ref.current.focus();
            }
        });
    }, [isFocused]);

    function handleChange(e) {
        onChange(index, e.target.value);
    }

    function handlePaste(e) {
        onPaste(e.clipboardData.getData("text"));
    }

    function handleKeyDown(e) {
        if (e.key === "Backspace") {
            onBackspace();
        }
    }

    function handleFocus(e) {
        e.target.setSelectionRange(0, 1);
        onFocus(index);
    }

    return (
        <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            maxLength="1"
            onFocus={handleFocus}
            disabled={isDisabled}
        />
    );
}
