import axios from 'axios'
import React from 'react'
import { Button, Card, Dropdown, DropdownButton, FormControl, InputGroup, Table } from 'react-bootstrap';
import "../styles/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { baseURL } from "../Config";
axios.defaults.baseURL = baseURL;

const MainTable = (props) => {
    const [sortByField, setSortByField] = React.useState("email");
    const [sortByOrder, setSortByOrder] = React.useState("desc");
    const [displaySurveys, setDisplaySurveys] = React.useState(<li></li>);

    React.useEffect(() => {
        if (sortByOrder === "asc") {
            props.showData && props.showData.sort((a, b) => {
                if (a[sortByField] > b[sortByField])
                    return 1;
                else return -1;
            })
        } else {
            props.showData && props.showData.sort((a, b) => {
                if (a[sortByField] < b[sortByField])
                    return 1;
                else return -1;
            })
        }
        const displayRows = props.showData && props.showData.map((row, index) => {
            let tags = row.hashtag.split(',')
            const displayTags = tags.map((tag, index) => {
                return (<Button variant="outline-secondary" size="sm" className="m-1 non-clickable" key={index}>{tag}</Button>)
            })
            return (<li key={index} className="custom-table-row">
                <div className="custom-table-col custom-table-col-1" data-label="S. No" >{index + 1}</div>
                <div className="custom-table-col custom-table-col-2" data-label="Email" >{row.email}</div>
                <div className="custom-table-col custom-table-col-3" data-label="Date &amp; Time" >{row.timeStamp.slice(0, 10)} , {row.timeStamp.slice(11, 19)}</div>
                <div className="custom-table-col custom-table-col-4" data-label="Mood Rating" >{row.moodRating}</div>
                <div className="custom-table-col custom-table-col-5" data-label="Hashtags" >{displayTags}</div>
            </li>)
        })
        setDisplaySurveys(displayRows)
    }, [sortByField, sortByOrder, props.showData]);
    const handleSortClick = field => {
        setSortByField(field);
        setSortByOrder(sortByOrder === "asc" ? "desc" : "asc");
    }
    return (
        <>
            <div>
                <ul className='custom-responsive-table'>
                    <li className="custom-table-header">
                        <div className="custom-table-col custom-table-col-1" >S. No</div>
                        <div className="custom-table-col custom-table-col-2 clickable" onClick={() => handleSortClick("email")}>
                            Email {sortByField === "email" ?
                                sortByOrder === "asc" ? <FontAwesomeIcon icon={faArrowUp} />
                                    : <FontAwesomeIcon icon={faArrowDown} />
                                : ""}
                        </div>
                        <div className="custom-table-col custom-table-col-3 clickable" onClick={() => handleSortClick("timeStamp")}>
                            Date &amp; Time {sortByField === "timeStamp" ?
                                sortByOrder === "asc" ? <FontAwesomeIcon icon={faArrowUp} />
                                    : <FontAwesomeIcon icon={faArrowDown} />
                                : ""}
                        </div>
                        <div className="custom-table-col custom-table-col-4 clickable" onClick={() => handleSortClick("moodRating")}>
                            Mood Rating {sortByField === "moodRating" ?
                                sortByOrder === "asc" ? <FontAwesomeIcon icon={faArrowUp} />
                                    : <FontAwesomeIcon icon={faArrowDown} />
                                : ""}
                        </div>
                        <div className="custom-table-col custom-table-col-5">Hashtags</div>
                    </li>
                    {displaySurveys}
                </ul>
            </div>
        </>
    )
}

function SurveyDataTable() {
    const [originalData, setOriginalData] = React.useState();
    const [showData, setShowData] = React.useState();
    const [filterBy, setFilterBy] = React.useState("email");

    const filterOptions = ["email", "moodRating", "date", "hashtag"];

    const handleFilterChange = (e) => {
        e.preventDefault();
        let tempData = Object.assign([], originalData);
        if (filterBy === "email") {
            tempData = tempData.filter((survey) => {
                return survey.email.includes(e.target.value);
            })
        }
        if (filterBy === "hashtag") {
            let tags = e.target.value.split(',')
            tempData = tempData.filter((survey) => {
                let flag = false;
                for (let i = 0; i < tags.length; i++){
                    if (survey.hashtag.toLowerCase().includes(tags[i].toLowerCase()))
                        flag = true;
                }
                return flag;
            })
        }
        if (filterBy === "date") {
            tempData = tempData.filter((survey) => {
                return survey.timeStamp.startsWith(e.target.value);
            })
        }
        if (filterBy === "moodRating") {
            tempData = tempData.filter((survey) => {
                return e.target.value === "" ? true : survey.moodRating === parseInt(e.target.value);
            })
        }
        setShowData(tempData);
    }

    React.useEffect(() => {
        axios
            .get('/api/dashboard/survey')
            .then((res) => {
                let surveys = [];
                res.data.forEach(survey => {
                    surveys.push({
                        ...survey,
                        email:survey.id.email,
                        timeStamp: survey.id.timeStamp
                    })
                });
                setOriginalData(surveys);
                setShowData(surveys);
            })
            .catch((err)=>{console.log("error in api/dashboard/survey",err);})
    }, [])
    
    const displayDropdowns = filterOptions.map((option, key) => {
        return (
            <Dropdown.Item onClick={()=>{setFilterBy(option)}} key={key}>{option}</Dropdown.Item>
        )
    })
    
    return (
        // <Card className="custom-dash-card">
        //     <Card.Body>
                
        //     </Card.Body>
        // </Card>
        <div className="pb-5">
            <InputGroup className="mb-3">
                <DropdownButton
                    variant="outline-secondary"
                    title={filterBy}
                    id="input-group-dropdown-1"
                >
                    {displayDropdowns}
                </DropdownButton>
                <FormControl type="text" onChange={handleFilterChange} placeholder={
                    filterBy === "date" ? "enter date in yyyy-dd-mm format," :
                        filterBy === "moodRating" ? "enter a mood rating between 1 to 10." :
                            filterBy === "hashtag" ? "enter multiple tags separated by , ex #new,#add" :
                                "enter user email address."
                } />
                <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
            </InputGroup>
            <MainTable showData={showData} />
        </div>
    )
}

export default SurveyDataTable




// const displayRows = props.showData && props.showData.map((row, index) => {
//     let tags = row.hashtag.split(',')
//     const displayTags = tags.map((tag, index) => {
//         return (<Button variant="outline-secondary" size="sm" className="m-1" key={index}>{tag}</Button>)
//     })
//     return (<tr key={index}>
//         <td>{index + 1}</td>
//         <td>{row.email}</td>
//         <td>{row.timeStamp.slice(0, 10)} , {row.timeStamp.slice(11, 19)}</td>
//         <td>{row.moodRating}</td>
//         <td>{displayTags}</td>
//     </tr>)
// })

// {/* <Table responsive hover>
//                 <thead>
//                     <tr>
//                         <th>S. No</th>
//                         <th onClick={() => handleSortClick("email")}>
//                             Email {sortByField === "email" ?
//                                 sortByOrder === "asc" ? <FontAwesomeIcon icon={faArrowUp} />
//                                     : <FontAwesomeIcon icon={faArrowDown} />
//                                 : ""}
//                         </th>
//                         <th onClick={() => handleSortClick("timeStamp")}>
//                             Date &amp; Time {sortByField === "timeStamp" ?
//                                 sortByOrder === "asc" ? <FontAwesomeIcon icon={faArrowUp} />
//                                     : <FontAwesomeIcon icon={faArrowDown} />
//                                 : ""}
//                         </th>
//                         <th onClick={() => handleSortClick("moodRating")}>
//                             Mood Rating {sortByField === "moodRating" ?
//                                 sortByOrder === "asc" ? <FontAwesomeIcon icon={faArrowUp} />
//                                     : <FontAwesomeIcon icon={faArrowDown} />
//                                 : ""}
//                         </th>
//                         <th>Hashtags</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {displaySurveys}
//                 </tbody>
//             </Table> */}
