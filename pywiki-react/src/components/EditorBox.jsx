import React, { useState, useEffect, useRef } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import "./css/NavigationStack.css";
import "./css/EditorView.css";
import {
    getTheme,
    setGlobalTheme,
    toastSuccess,
    toastFailure,
    API_BASE_URL
} from "../utils/utils.js";
import CommentsWidget from "./CommentsWidget.jsx";
import { HighlightWithinTextarea } from "react-highlight-within-textarea";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

function EditorBox({ pageData, userData }) {
    setGlobalTheme('dark');

    const { title, markdown, category } = pageData.data;
    const [sidePanelWidth, setSidePanelWidth] = useState("300px");
    const [themeBtn, setThemeBtn] = useState("Light Mode");
    const [isSaving, setIsSaving] = useState(false);
    const [borderColor, setBorderColor] = useState("#434549");
    const [editorWidth, setEditorWidth] = useState("600px");

    const root = document.documentElement;
    const titleRef = useRef(null);
    const categoryRef = useRef(null);
    const contentRef = useRef(null);
    const [isMobile, setMobile] = useState(false);
    const [value, setValue] = useState(markdown);
    const onChange = (value) => setValue(value);

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

    useEffect(() => {
        const handleSaveKeyPress = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "s") {
                event.preventDefault();
                saveFunction();
            }
        };

        window.addEventListener("keydown", handleSaveKeyPress);
        return () => {
            window.removeEventListener("keydown", handleSaveKeyPress);
        };
    }, []);

    function setThemeColors() {
        const theme = getTheme();
        const hoverColor = theme === "dark" ? "#2f3239" : "#ededed";
        const activeColor = theme === "dark" ? "#393d44" : "#dedede";

        root.style.setProperty("--navLink-hover-bg-color", hoverColor);
        root.style.setProperty("--navLink-active-bg-color", activeColor);
    }

    function formatString(inputString) {
        const lowercaseString = inputString.toLowerCase();
        return lowercaseString.replace(/\s+/g, "-");
    }

    function toEditor() {
        const finalSegment = window.location.href.split("/").pop();
        window.location.href = "/editor/" + finalSegment;
    }

    function logoutUser() {
        console.log("Logging out...");

        fetch("/api/log-out", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
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
        const theme = getTheme();
        if (theme === "dark") {
            setGlobalTheme("light");
            setThemeBtn("Dark Mode");
        } else {
            setGlobalTheme("dark");
            setThemeBtn("Light Mode");
        }
        setThemeColors();
    }

    const saveFunction = async () => {
        setIsSaving(true);

        console.log(JSON.stringify({
            oldTitle: title,
            newTitle: titleRef.current.value,
            category: categoryRef.current.value,
            markdown: value,
        }));

        try {
            const response = await fetch(API_BASE_URL + "/save-page", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    oldTitle: title,
                    newTitle: titleRef.current.value,
                    category: categoryRef.current.value,
                    markdown: value,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            const data = await response.json();
            console.log(data);

            if (data.success) {
                console.log("Success!");
                toastSuccess(`"${title}" was saved!`);
                setBorderColor("#28a745");
                setTimeout(() => {
                    setBorderColor("#434549");
                }, 3000);
                return true;
            } else {
                console.log("Failure!");
                toastFailure(`"${title}" was unable to be saved!`);
                setBorderColor("#dc3545");
                setTimeout(() => {
                    setBorderColor("#434549");
                }, 3000);
                return false;
            }
        } catch (error) {
            console.error(
                "There was a problem with the fetch operation:",
                error
            );
            setBorderColor("#dc3545");
            setTimeout(() => {
                setBorderColor("#434549");
            }, 3000);
            return false;
        }

        setIsSaving(false);
    };

    async function toPage() {
        const saved = await saveFunction();
        console.log(saved);

        if (saved) {
            const finalSegment = window.location.href.split("/").pop();
            window.location.href = "/page/" + finalSegment;
        }
    }

    async function toDelete() {
        const saved = await saveFunction();
        console.log(saved);

        if (saved) {
            const finalSegment = window.location.href.split("/").pop();
            window.location.href = "/delete/" + finalSegment;
        }
    }

    function downloadFile() {
        const textareaContent = contentRef.current.value;
        const blob = new Blob([textareaContent], { type: "text/plain" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = formatString(title) + ".txt";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    const container = {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
    };

    const row = {
        flex: 1,
    };

    const sidePanel = {
        width: sidePanelWidth,
    };

    const rightPanel = {
        width: sidePanelWidth,
        marginTop: "10px",
    };

    const stack = {
        marginTop: "10px",
    };

    const card = {
        width: isMobile ? "100%" : "640px",
        borderColor,
        transition: "0.5s",
        marginBottom: '10px',
    };

    setThemeColors();

    const highlights = [
        {
            highlight: /\[(?:\r?\n|[\r\n])(?:.*?)(?:\r?\n|[\r\n])\]/gms,
            className: "table-highlight",
            highlightStyle: { backgroundColor: "var(--link-highlight-color)" },
            component: (props) => (
              <Tippy content="Table">
                <mark style={{ backgroundColor: "var(--link-highlight-color)" }}>
                  {props.children}
                </mark>
              </Tippy>
            ),
          },
        {
            highlight: /\{(?:\r?\n|[\r\n])(?:.*?)(?:\r?\n|[\r\n])\}/gms,
            className: "infobox-highlight",
            highlightStyle: { backgroundColor: "var(--infobox-highlight-color)" },
            component: (props) => (
              <Tippy content="Infobox">
                <mark style={{ backgroundColor: "var(--infobox-highlight-color)" }}>
                  {props.children}
                </mark>
              </Tippy>
            ),
          },
          {
            highlight: /\[([^\]]+?)\]\(([^)]+)\)/g,
            className: "link-highlight",
            highlightStyle: { backgroundColor: "var(--link-highlight-color)" },
            component: (props) => (
              <Tippy content="External Link">
                <mark style={{ backgroundColor: "var(--link-highlight-color)" }}>
                  {props.children}
                </mark>
              </Tippy>
            ),
          },
        {
            highlight: /\[\[(.*?)\]\]/g,
            className: "link-highlight",
            highlightStyle: { backgroundColor: "var(--link-highlight-color)" },
            component: (props) => (
              <Tippy content="Wiki Link">
                <mark style={{ backgroundColor: "var(--link-highlight-color)" }}>
                  {props.children}
                </mark>
              </Tippy>
            ),
          },
          {
            highlight: /(\[.*?\])/g,
            className: "footnote-highlight",
            highlightStyle: { backgroundColor: "var(--footnote-highlight-color)" },
            component: (props) => (
              <Tippy content="Footnote">
                <mark style={{ backgroundColor: "var(--footnote-highlight-color)" }}>
                  {props.children}
                </mark>
              </Tippy>
            ),
          },
        {
          highlight: /^(>+)\s*(.+?)$/gm,
          className: "quote-highlight",
          component: (props) => (
            <Tippy content="Blockquote">
              <mark style={{ backgroundColor: "var(--quote-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
        },
        {
          highlight: /\*{3}(.*?)\*{3}|_{3}(.*?)_{3}/g,
          className: "emphatic-highlight",
          highlightStyle: { backgroundColor: "var(--emphatic-highlight-color)" },
          component: (props) => (
            <Tippy content="Double Emphasis">
              <mark style={{ backgroundColor: "var(--emphatic-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
        },
        {
          highlight: /\*\*(.*?)\*\*|__(.*?)__/g,
          className: "bold-highlight",
          highlightStyle: { backgroundColor: "var(--bold-highlight-color)" },
          component: (props) => (
            <Tippy content="Bold">
              <mark style={{ backgroundColor: "var(--bold-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
        },
        {
          highlight: /(?<!\*|_)(\*.*?\*)|(?<!_)_(.*?)_/g,
          className: "italic-highlight",
          highlightStyle: { backgroundColor: "var(--italic-highlight-color)" },
          component: (props) => (
            <Tippy content="Italics">
              <mark style={{ backgroundColor: "var(--italic-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
        },
        {
          highlight: /(?<!\\)(?:\\\\)*(`+)\b(.+?)\b\1/g,
          className: "code-highlight",
          highlightStyle: { backgroundColor: "var(--code-highlight-color)" },
          component: (props) => (
            <Tippy content="Code Snippet">
              <mark style={{ backgroundColor: "var(--code-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
        },
        {
          highlight: /^#{1,6}\s*(.+?)$/gm,
          className: "header-highlight",
          highlightStyle: { backgroundColor: "var(--header-highlight-color)" },
          component: (props) => (
            <Tippy content="Header">
              <mark style={{ backgroundColor: "var(--header-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
        },
        {
          highlight: /!\[(.+?)\]\((.+?)\)/g,
          className: "image-highlight",
          highlightStyle: { backgroundColor: "var(--image-highlight-color)" },
          component: (props) => (
            <Tippy content="Image">
              <mark style={{ backgroundColor: "var(--image-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
        },
        {
          highlight: /^(\s*)\d+\.\s+(.+?)$/gm,
          component: (props) => (
            <Tippy content="Numbered List">
              <mark style={{ backgroundColor: "var(--numbered-list-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
          className: "numbered-list-highlight",
        },
        {
          highlight: /^(\s*)(-|\*|\+)\s+(.+?)$/gm,
          component: (props) => (
            <Tippy content="Bulleted List">
              <mark style={{ backgroundColor: "var(--list-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
          className: "list-highlight",
        },
        {
          highlight: /^---+$/gm,
          className: "hr-highlight",
          highlightStyle: { backgroundColor: "var(--hr-highlight-color)" },
          component: (props) => (
            <Tippy content="Horizontal Rule">
              <mark style={{ backgroundColor: "var(--hr-highlight-color)" }}>
                {props.children}
              </mark>
            </Tippy>
          ),
        },
      ];

    return (
        <Container style={container}>
            <Row style={row}>
                <Col
                    style={sidePanel}
                    md={3}
                    className="d-first d-xl-block order-first"
                >
                    <Card className="primary" style={stack}>
                        <Card.Header as="h3" className='text-center' style={{paddingRight: '20px',}}>The Riveon Wiki</Card.Header>
                        <Card.Body>
                            <div className="navLink" onClick={saveFunction}>
                                <i className="fas fa-save"></i>
                                &nbsp;&nbsp;&nbsp;Save
                            </div>
                            <div className="navLink" onClick={toPage}>
                                <i className="fas fa-times"></i>
                                &nbsp;&nbsp;&nbsp;Return
                            </div>
                            <div className="navLink" onClick={downloadFile}>
                                <i className="fas fa-download"></i>
                                &nbsp;&nbsp;&nbsp;Download TXT
                            </div>
                            {/* <div className="navLink" onClick={toggleDarkMode}> */}
                            {/* <i className="fas fa-adjust"></i>&nbsp;&nbsp;&nbsp;{themeBtn} */}
                            {/* </div> */}
                            <div
                                className="navLink text-danger"
                                onClick={toDelete}
                            >
                                <i class="fas fa-trash-alt"></i>
                                &nbsp;&nbsp;&nbsp;Delete
                            </div>
                        </Card.Body>
                        <Card.Footer className="text-muted text-center">
                            Signed in as {userData.first_name}
                        </Card.Footer>
                    </Card>
                </Col>
                <Col style={row} md>
                    <Stack style={stack} gap={3}>
                        <Card className="" style={card}>
                            <Card.Header as="h3" className="noMargin">
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    ref={titleRef}
                                    className="textBox titleBox"
                                    defaultValue={title}
                                    placeholder="Title Goes Here."
                                />
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    ref={categoryRef}
                                    className="textBox categoryBox"
                                    defaultValue={category}
                                    placeholder="Category Goes Here."
                                />
                            </Card.Header>
                            <Card.Body className="textArea">
                                <Card.Text>
                                    {/* <Form className="noMargin w-100">
                                        <Form.Group
                                            className="noMargin w-100"
                                            controlId="exampleForm.ControlTextarea1"
                                        > */}
                                    <HighlightWithinTextarea
                                        value={value}
                                        className="textAreaNew"
                                        highlight={highlights}
                                        onChange={onChange}
                                        ref={contentRef}
                                    />

                                    {/* <Form.Control
                                                as="textarea"
                                                className="textArea shadow-none w-100"
                                                rows={30}
                                                ref={contentRef}
                                            >
                                                {markdown}
                                            </Form.Control> */}
                                    {/* </Form.Group>
                                    </Form> */}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Stack>
                </Col>
                <Col
                    style={rightPanel}
                    md={3}
                    className="d-none d-xl-block order-last"
                >
                    <CommentsWidget></CommentsWidget>
                </Col>
            </Row>
        </Container>
    );
}

export default EditorBox;
