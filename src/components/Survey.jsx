import React from 'react'
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import MyNavbar from './MyNavbar';
import { WithContext as ReactTags } from 'react-tag-input';
import axios from 'axios';
import { Zoom } from 'react-reveal';
import '../styles/Survey.css';
import { baseURL } from "../Config";
axios.defaults.baseURL = baseURL;

const Rating = (props) => {

    const mojis = ['😤', '😡', '😠', '😩', '☹️', '😐', '🙂','😊', '😄','🤩'];
    const handleRatingChange = (e) => {
        e.preventDefault()
        props.setData({ ...props.data, moodRating: parseInt(e.target.value) });
    }
    return (
        <> 
        <div className="container">
                <div className="moji">{mojis[props.data.moodRating-1]}</div>
            <div className="slider">
                <span className="rating-desc" >Uhhh!</span>
                    <input type="range" min={1} max={10} step={1} value={props.data.moodRating} className='custom-slider my-auto'
                        onChange={handleRatingChange} required/>
                    <span className="rating-desc">Yayy!!</span>
            </div>
        </div>
        </>
    )
}

const HashtagInput = (props) => {
    const KeyCodes = {
        comma: 188,
        space: 32,
        enter: [10, 13],
    };
    const delimiters = [...KeyCodes.enter,KeyCodes.comma,KeyCodes.space,KeyCodes.hash]
    
    const suggestions= props.suggestions || [
        { id: 'Skype', text: 'Skype' },
        { id: 'Meeting', text: 'Meeting' },
        { id: 'DOD_issue', text: 'DOD_issue' },
        { id: 'MissingOfficeLife', text: 'MissingOfficeLife' },
        { id: 'WorkFromHome', text: 'WorkFromHome' },
    ]

    const handleDelete =(i)=>{
        const tags = props.data.hashtag;
        props.setData({
            ...props.data,
            hashtag: tags.filter((tag, index) => index !== i),
        })
    }

    const handleAddition = (tag) => {
        if (props.data.hashtag.length < 5) {
            props.setData({
                ...props.data,
                hashtag: [...props.data.hashtag, tag],
            })
        }
    }

    return (
        <Form.Group className="mb-3">
            <Form.Label >HashTags</Form.Label>
                <div>
                <ReactTags tags={props.data.hashtag}
                    autofocus={false}
                    maxLength={50}
                    minQueryLength={1}
                    delimiters={delimiters}
                    suggestions={suggestions}
                    placeholder="You can enter upto 5 tags (without # symbol)."
                    handleDelete={handleDelete}
                    handleAddition={handleAddition}/>
            </div>
        </Form.Group>
    )
}

function Survey() {
    const [error, setError] = React.useState();
    const [suggestions, setSuggestions] = React.useState();
    const [data, setData] = React.useState({
        id: {
            email:"",
        },
        moodRating: 6,
        hashtag: [],
        reason:"",
    });
    React.useEffect(() => {
        let t_suggest = [];
        axios
            .get('api/dashboard/hashtags')
            .then((res) => {
                res.data.forEach((tag, index) => {
                    t_suggest.push({
                        id: tag.substring(1), text: tag.substring(1),
                    });
                })
                setSuggestions(t_suggest);
            }).catch(()=>{console.log("error /hashtags");})
    },[])
    React.useEffect(() => {
        const timer = setTimeout(() => setError({ errorType: undefined, message: "" }), 5000)
        return () => { clearTimeout(timer) }
    }, [error])

    const handleFormSubmit = (e) => {
        e.preventDefault();
        let finalData = Object.assign({}, data);
        const reEm = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!reEm.test(String(finalData.id.email).toLowerCase())) {
            setError({ type: "danger", message: "Invalid Email address" });
            window.scroll(0, 0);
            return
        }
        if (!finalData.id.email) {
            setError({ type: "danger", message: "Email Id is required" });
            window.scroll(0, 0);
            return
        }

        let hashString = "";
        finalData.hashtag.forEach((tag, index) => {
            if (tag.text.charAt(0) === "#")
                tag.text = tag.substring(1);
            if(tag.text.length > 0)
                hashString = hashString.concat("#" + tag.text + ",");
        })
        finalData.hashtag = hashString.substring(0, hashString.length - 1);
        console.log(finalData);
        axios
            .post("/api/survey", finalData)
            .then((res) => {
                console.log(res.data)
                setData({
                    id: {
                        email: "",
                    },
                    moodRating: 6,
                    hashtag: [],
                    reason: "",
                })
                setError({ type: "success", message: "Survey submitted successfully. View results in " });
                window.scroll(0, 0);
            })
            .catch((err) => {
                setError({ type: "danger", message: "Something went wrong" });
                window.scroll(0, 0);
        })
    }
    return (
        <>
            <MyNavbar link="/dashboard" title="Go To Dashboard" />
            <div className="survey-bg">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={6} md={10} sm={12} className="my-5">
                            <Zoom>
                                <Card className="p-4 survey-card">
                                    <Card.Body>
                                        {
                                            error && error.type ? <Alert variant={error.type}>
                                                {error.message}
                                                {error.type === "success" ? <a href='/dashboard'>Dashboard</a>:""}
                                            </Alert> : ""
                                        }
                                        <h4 className="text-center mb-3">How's your mood today ?</h4>
                                        <Form>

                                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                <Form.Label className='required'>Email address</Form.Label>
                                                <Form.Control type="email" placeholder="name@example.com" required className="custom-input"
                                                    onChange={(e) => setData({ ...data, id: { email: e.target.value } })} value={data.id.email}/>
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="exampleForm.ControlRating">
                                                <Form.Label className='required'>Mood Rating</Form.Label>
                                                <Rating data={data} setData={setData} />
                                            </Form.Group>

                                            <HashtagInput data={data} setData={setData} suggestions={suggestions} />

                                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                                <Form.Label>Reason</Form.Label>
                                                <Form.Control type="text" maxLength="80" className="custom-input" placeholder="Enter your reason for feedback."
                                                    onChange={(e) => setData({ ...data, reason: e.target.value })} value={data.reason} />
                                            </Form.Group>
                                            <div className="justify-content-center d-flex mt-5 mb-2">
                                                <Button variant="secondary" type="submit" onClick={handleFormSubmit}
                                                    style={{
                                                        width: "100%", backgroundImage: "linear-gradient(to left,#74ebd5,#9face6)",
                                                        border: 'none', fontWeight: "600",
                                                    }} >
                                                    Submit
                                                </Button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Zoom>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default Survey
