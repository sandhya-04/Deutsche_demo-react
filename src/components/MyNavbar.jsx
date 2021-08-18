import React from 'react'
import { Container, Nav, Navbar } from "react-bootstrap";

const styles = {
    customBrand:{
        width:"200px",
    },
    customNav: {
        width: "200px",
        flexDirection:"row-reverse",
    }
}
export default function MyNavbar(props){
    return (
        <>
        <Navbar bg="dark" variant="dark" fixed="top">
            <Container>
                <Navbar.Brand href="#" style={styles.customBrand}>
                    <img src="assets/db_logo.png" style={{ height: "48px", width: "48px", objectFit: "cover" }}/>
                </Navbar.Brand>
                <div className="mx-auto text-white text-center">
                    <h4>Employee Mood Ratings</h4>
                </div>
                <Nav className="ml-auto text-center" style={styles.customNav}>
                    <Nav.Link href={props.link}>{props.title}</Nav.Link>
                </Nav>
            </Container>
            </Navbar>
            <div style={{height:'60px'}}></div>
            </>
    )
}
