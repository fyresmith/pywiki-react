import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import PageView from "./PageView";
import Stack from "react-bootstrap/Stack";
import { API_BASE_URL } from "../utils/api.js";
import PageNavWidget from "./PageNavWidget";
import DocumentWidget from "./DocumentWidget";
import InfoBoxWidget from "./InfoBoxWidget";
import CommentsWidget from "./CommentsWidget";
import RecentPagesWidget from "./RecentPagesWidget";

function PageBox({ pageName, userData }) {
    const [pageData, setPageData] = useState(null);
    const [isMobile, setMobile] = useState(false);

    useEffect(() => {
        function handleResize() {
            const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);
            const isSmallScreen = window.innerWidth < 1200;
            setMobile(isMobileDevice || isSmallScreen);

        }

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const container = {
        display: "flex",
        flexDirection: "column",
        height: "100vh", // Set the container to full viewport height
    };

    const row = {
        flex: 1, // Make the row fill the remaining vertical space
    };

    const sidePanel = {
        width: isMobile ? '100%' : '300px',
    };

    const getPage = async () => {
        try {
            const response = await fetch(API_BASE_URL + "/page/" + pageName, {
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
                console.log("Page retrieval successful.");
                setPageData(data); // Set the page data in state
            } else {
                console.log("Page retrieval unsuccessful.");
            }
        } catch (error) {
            console.error(
                "There was a problem with the fetch operation:",
                error
            );
        }
    };

    useEffect(() => {
        getPage(); // Call getPage when the component mounts or pageName changes
    }, [pageName]);

    if (!pageData) {
        return <div>Loading...</div>;
    }

    console.log(pageData.data.infoBox);
    console.log(userData);

    if (isMobile) {
        return (
            <Container style={container}>
                <Row style={row}>
                    <Col
                        style={sidePanel}
                        md={3}
                        className="d-first d-xl-block order-first"
                    >
                        <Stack style={{ marginTop: "10px" }} gap={3}>
                            <PageNavWidget userData={userData}></PageNavWidget>
                            <InfoBoxWidget
                                infoBox={pageData.data.infoBox}
                            ></InfoBoxWidget>
                            <DocumentWidget pageData={pageData}></DocumentWidget>
                        </Stack>
                    </Col>
                    <Col style={row} md>
                        <PageView
                            title={pageData.data.title}
                            html={pageData.data.html}
                            tableOfContents={pageData.data.tableOfContents}
                        ></PageView>
                    </Col>
                    <Col
                        style={sidePanel}
                        md={3}
                        className="d-none d-xl-block order-last"
                    >
                        <Stack style={{ marginTop: "10px" }} gap={3}>
                            <CommentsWidget></CommentsWidget>
                            <RecentPagesWidget></RecentPagesWidget>
                        </Stack>
                    </Col>
                </Row>
            </Container>
        );
    } else {
        return (
            <Container style={container}>
                <Row style={row}>
                    <Col
                        style={sidePanel}
                        md={3}
                        className="d-first d-xl-block order-first"
                    >
                        <Stack style={{ marginTop: "10px" }} gap={3}>
                            <PageNavWidget userData={userData}></PageNavWidget>
                            <DocumentWidget pageData={pageData}></DocumentWidget>
                        </Stack>
                    </Col>
                    <Col style={row} md>
                        <PageView
                            title={pageData.data.title}
                            html={pageData.data.html}
                            tableOfContents={pageData.data.tableOfContents}
                        ></PageView>
                    </Col>
                    <Col
                        style={sidePanel}
                        md={3}
                        className="d-none d-xl-block order-last"
                    >
                        <Stack style={{ marginTop: "10px" }} gap={3}>
                            <InfoBoxWidget
                                infoBox={pageData.data.infoBox}
                            ></InfoBoxWidget>
                            <CommentsWidget></CommentsWidget>
                            <RecentPagesWidget></RecentPagesWidget>
                        </Stack>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default PageBox;
