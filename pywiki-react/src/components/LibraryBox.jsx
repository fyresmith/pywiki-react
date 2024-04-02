import React from "react";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Stack from "react-bootstrap/Stack";
import NavWidget from "./NavWidget";
import RecentPagesWidet from "./RecentPagesWidget";
import LibraryView from "./LibraryView";

function LibraryBox({ userData }) {
    const [sidePanelWidth, setSidePanelWidth] = useState("300px");

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 768) {
                setSidePanelWidth("100%"); // Set full width when stacked on top
            } else {
                setSidePanelWidth("300px"); // Set 300px width until stacked on top
            }
        }

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const container = {
        display: "flex",
        flexDirection: "column",
    };

    const cell = {
        // border: '1px solid #000',
    };

    const sidePanel = {
        width: sidePanelWidth,
    };
    
    const stack = {
        marginTop: "10px",
    };

    return (
        <Container style={container}>
            <Row>
                <Col
                    style={sidePanel}
                    md={3}
                    className="d-first d-xl-block order-first"
                >
                    <Stack style={stack} gap={3}>
                        <NavWidget userData={userData}></NavWidget>
                    </Stack>
                </Col>
                <Col style={cell} md>
                    <LibraryView userData={userData}></LibraryView>
                </Col>
                <Col
                    style={sidePanel}
                    md={3}
                    className="d-none d-xl-block order-last"
                >
                    <Stack style={stack} gap={3}>
                        <RecentPagesWidet></RecentPagesWidet>
                    </Stack>
                </Col>
            </Row>
        </Container>
    );
}

export default LibraryBox;