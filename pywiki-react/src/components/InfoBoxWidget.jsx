import React from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import "./css/InfoBox.css";
import { linkify } from '../utils/utils.js';

function CustomGridItem({ title, value }) {
    return (
        <Row>
            <Col xs={5} className="d-flex labelTitle fw-bold">
                {title}
            </Col>
            <Col xs={7} className="labelValue" dangerouslySetInnerHTML={{ __html: value }}>
            </Col>
        </Row>
    );
}

function translateInfoCard(infoBoxMarkdown) {
    const lines = infoBoxMarkdown.split("\n");
    let cardContent = [];
    let inList = false;
    let listItemContent = [];

    lines.forEach((line) => {
        if (line.startsWith("# ")) {
            if (inList) {
                inList = false;
                cardContent.push(
                    <ListGroup className="list-group-flush">
                        {listItemContent}
                    </ListGroup>
                );
                listItemContent = [];
            }

            cardContent.push(
                <Card.Header className="text-center" key={`header-${line}`}>
                    {line.slice(2)}
                </Card.Header>
            );
        } else if (line.startsWith("[")) {
            if (inList) {
                inList = false;
                cardContent.push(
                    <ListGroup className="list-group-flush">
                        {listItemContent}
                    </ListGroup>
                );
                listItemContent = [];
            }
            console.log('found an img');

            cardContent.push(
                <Card.Img variant="middle" src={line.slice(1, -1)} key={line} />
            );
        } else if (line.startsWith("## ")) {
            if (inList) {
                inList = false;
                cardContent.push(
                    <ListGroup className="list-group-flush">
                        {listItemContent}
                    </ListGroup>
                );
                listItemContent = [];
            }

            cardContent.push(
                <Card.Header
                    variant="middle"
                    className="text-center infoGroup"
                    key={`header-${line}`}
                >
                    {line.slice(3)}
                </Card.Header>
            );
        } else if (line.startsWith("! ")) {
            if (inList) {
                inList = false;
                cardContent.push(
                    <ListGroup className="list-group-flush">
                        {listItemContent}
                    </ListGroup>
                );
                listItemContent = [];
            }

            cardContent.push(
                <Card.Body className="infoBody" key={`body-${line}`}>
                    <Card.Text className="infoText">{line.slice(2)}</Card.Text>
                </Card.Body>
            );
        } else if (line.includes("|")) {
            if (!inList) {
                inList = true;
            }

            const [label, value] = line.split("|").map((item) => item.trim());
            listItemContent.push(
                <ListGroup.Item key={`${label}-${value}`} className="list-group-item">
                    <CustomGridItem title={label} value={linkify(value)} />
                </ListGroup.Item>
            );
        }
    });

    if (inList && listItemContent.length > 0) {
        cardContent.push(
            <ListGroup key="listGroup" className="list-group-flush">
                {listItemContent}
            </ListGroup>
        );
    }

    return <Card>{cardContent}</Card>;
}

function InfoBoxWidget({ infoBox }) {
    if (infoBox) {
        return <div>{translateInfoCard(infoBox)}</div>;
    } else {
        return null;
    }
}

export default InfoBoxWidget;