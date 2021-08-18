import React from 'react'
import { Alert, Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap'
import MyNavbar from './MyNavbar'
import Chart from "react-apexcharts";
import "../styles/Dashboard.css";
import axios from 'axios';
import CountUp from 'react-countup';
import SurveyDataTable from './SurveyDataTable';
import _ from 'lodash';
import { Slide, Zoom } from 'react-reveal';
import { baseURL } from "../Config";
axios.defaults.baseURL = baseURL;

const BoxesContainer = (props) => {
  // const defaultData = props.defaultData;
  const noOfResponsePastXDays = props.lastXDaysResponses.length
    // ?props.info.lastXDaysResponses.length : defaultData.noOfResponsePastXDays;
  const trendingHashTags = props.hashtags.slice(0,3)
    // ?props.info.hashtags.slice(0, 3) : defaultData.trendingHashTags;
  const avgMoodRatingToday = props.avgMoodRatingToday
    // ?props.info.avgMoodRatingToday : defaultData.avgMoodRatingToday;
  
  let happiestDay = Object.keys(props.lastXDaysAvgRating)
    .reduce((a, b) => props.lastXDaysAvgRating[a] > props.lastXDaysAvgRating[b] ? a : b);
  
  return (
    <Row className="justify-content-center">
      <Col lg={8} xs={10}>
        <Card className="custom-dash-card">
          <Card.Body>
            <Row className="justify-content-center">
              <Col lg={5} xs={10} className='p-4 m-2 box-1 box'>
                <h5>Responses in past {props.pastDaysCount} days</h5>
                <h3><b><CountUp end={noOfResponsePastXDays} duration={3} /></b></h3>
              </Col>
              <Col lg={5} xs={10} className='p-4 m-2 box-2 box'>
                <h5>Trending Hashtags</h5>
                <div>
                  {trendingHashTags && trendingHashTags.map((tag, index) => {
                    return (<Button variant="secondary" size="sm" className="m-1" key={index}>{tag}</Button>)
                  })}
                </div>
              </Col>
              <Col lg={5} xs={10} className='p-4 m-2 box-3 box'>
                <h5>Avg Mood Rating Today</h5>
                <h3><b><CountUp end={avgMoodRatingToday} decimals={1} duration={3} /></b></h3>
              </Col>
              <Col lg={5} xs={10} className='p-4 m-2 box-4 box'>
                <h5>Happiest Day</h5>
                <h3><b>{happiestDay}</b></h3>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

const GraphContainer = (props) => {
  const colors = ["#267EC3", "#26E7A6", "#FEBC3B", "#FF6178", "#D830EB"]
  const emoji = { "1 - 2": '😡', "3 - 4": '😩', "5 - 6": '😐', "7 - 8": '😊', "9 - 10": '🤩' };
  let barPlotData = [], barPlotLabel = [];
  for (let [dateCurr, avgCurr] of Object.entries(props.lastXDaysAvgRating)) {
    barPlotData.push(parseInt(avgCurr));
    barPlotLabel.push(dateCurr.toString());
  }
  let donutPlotData = [], donutPlotLabel = [];
  for (let [category, avg] of Object.entries(props.lastYDaysCategoryAvg)) {
    donutPlotData.push(parseInt(avg));
    donutPlotLabel.push(category);
  }
  const donutData = {
    series: donutPlotData,
    options: {
      labels: donutPlotLabel,
      chart: { width: 380, type: 'donut', },
      plotOptions: { pie: { startAngle: -90, endAngle: 270 } },
      dataLabels: {
        enabled: true, formatter: (val, opts) => { return emoji[opts.w.globals.labels[opts.seriesIndex]] }
      },
      fill: {type: 'gradient',},
      legend: {
        fontSize:'18px',
        formatter: (val, opts) => { return emoji[val] + " -- " + opts.w.globals.series[opts.seriesIndex] }
      },
      title: { text: "Today's Mood Ratings" },
      responsive: [{
        breakpoint: 767,
        options: {
          legend:{fontSize:'14px'}
        }
      }]
    },
  }
  
  const barData = {
    series: [{data: barPlotData}],
    options: {
      labels:barPlotLabel,
      chart: { height: 350, type: 'bar', events: { click: function (chart, w, e) { } }, },
      colors: colors,
      plotOptions: {
        bar: { columnWidth: '45%', distributed: true, }
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: {
        categories: barPlotLabel,
        labels: { style: { colors: colors, fontSize: '14px' } }
      },
      yaxis: {
        title: { text: "Avg Rating", style: { fontSize: '14px' } },
        labels: { style: { fontSize: '14px' } }
      }
    }
  }
  return (
    <Row className="justify-content-center my-5">
      <Col lg={5} xs={10}>
        {!_.isEmpty(barPlotData) ? <Chart options={barData.options} series={barData.series} type="bar" />
          : "No Data Found, unable to plot bar graph"}
      </Col>
      <Col lg={4} xs={10}>
        {!_.isEmpty(donutPlotData) ? <Chart options={donutData.options} series={donutData.series} type="donut" />
          :"No Data entries found for today, pie chart cannot be constructed"}
      </Col>
    </Row>
  )
}

const BadMoodRatings = (props) => {
  const [badMoodEmp, setBadMoodEmp] = React.useState();
  const [suggestions, setSuggestions] = React.useState({
    1: ["Take a break. Spend some time with family."],
    2: ["Give them a place to engage with each other."],
    3: ["Have 1:1 meeting with manager."],
    4: ["Remind and thank them for their contribution."],
  });

  React.useEffect(() => {
    axios
      .get('/api/dashboard/survey/badMoodSince/3')
      .then((res) => {
        setBadMoodEmp(res.data);
      }).catch((err) => console.log("baad mood data",err));
  },[])
  const displayRows = badMoodEmp && Object.keys(badMoodEmp).map(function (key) {
    const suggestionList = suggestions[Math.floor(badMoodEmp[key])];
    const ourSuggestion = suggestionList[Math.floor(Math.random() * suggestionList.length)]
    
    return (
      <tr key={key}>
        <td>{key}</td>
        <td>{badMoodEmp[key]}</td>
        <td>{ourSuggestion}</td>
      </tr>
    )
  });
  return (
    <Card className="custom-dash-card">
      <Card.Body>
        {_.isEmpty(badMoodEmp)
          ?
          <Alert variant="success">Yayyy !!! everyone is having a good mood. {"😊"} ...</Alert>
          :
          <>
            <Alert variant="danger">Following employees are having a bad mood in past 3 days.</Alert>
            <Table hover>
              <thead>
                <tr><th>email</th><th>Mood Rating</th><th>Our suggestions</th></tr>
              </thead>
              <tbody>
                {displayRows}
              </tbody>
            </Table>
          </>
        }
      </Card.Body>
    </Card>
  )
}


export default function Dashboard() {
  
  const [hashtags, setHashtags] = React.useState()                          //  [tag1,tag2,...]
  const [lastXDaysAvgRating, setLastXDaysAvgRating] = React.useState()      //  {date1:avg1,date2:avg2...}
  const [avgMoodRatingToday, setAvgMoodRatingToday] = React.useState()            //  {today:avg}
  const [lastXDaysResponses, setLastXDaysResponses] = React.useState()      //  [{res1},{res2},...]
  const [lastYDaysCategoryAvg, setLastYDaysCategoryAvg] = React.useState()  //  [{cat1:avg1},{cat2:avg2}...]
  const [analysing, setAnalysing] = React.useState(true);
  const [error, setError] = React.useState();

  React.useEffect(() => {
    const timer = setTimeout(() => setAnalysing(false), 7000)
    return () => { clearTimeout(timer) }
  }, [])

  // initial test default data
  const [defaultData, setDefaultData] = React.useState({
    pastDaysCount: 5,           //  for use in past X days
    emojiAvgDays: 0,            //  for use in category avg as Y
    badMoodSince:3,             //  for use in finding bad mood ratings
    lastXDaysAvgRating: {
      "2021-08-12": "9.0", "2021-08-13": "4.4194", "2021-08-14": "10.0"
    },
    lastYDaysCategoryAvg: {
      "5 - 6": "30", "9 - 10": "4", "1 - 2": "10", "3 - 4": "15", "7 - 8": "32"
    },
    trendingHashTags: ["#PositiveImpact", "#wfh", "#Skype"],
    noOfResponsePastXDays: 234,
    avgMoodRatingToday: 8.6,
  });

  React.useEffect(async () => {
    
    // 1. Trending hashtags
    await axios
      .get('/api/dashboard/hashtags')
      .then((res) => {
        setHashtags(res.data);
      }).catch((err) => { setError({type:"danger",message:err.message}) })
    
      // 2. Last X days average
    await axios
      .get('/api/dashboard/survey/latestAvg/' + defaultData.pastDaysCount)
      .then((res) => {
        setLastXDaysAvgRating(res.data);
      }).catch((err) => { setError({ type: "danger", message: err.message }) })
    
    // 3. Last X days response
    await axios
      .get('/api/dashboard/survey/latestData/' + defaultData.pastDaysCount)
      .then((res) => {
        setLastXDaysResponses(res.data);
      }).catch((err) => { setError({ type: "danger", message: err.message }) })
    
      // 4. Last Y days emoji category avg rating
    await axios
      .get('/api/dashboard/survey/avgCategoriesRating/' + defaultData.emojiAvgDays)
      .then((res) => {
        setLastYDaysCategoryAvg(res.data)
      }).catch((err) => { setError({ type: "danger", message: err.message }) })
    
    // 5. Today's average
    await axios
      .get('/api/dashboard/survey/latestAvg/0')
      .then((res) => {
        if(_.isEmpty(res.data))
          setAvgMoodRatingToday(0)
        else
          setAvgMoodRatingToday(res.data[Object.keys(res.data)[0]])
      }).catch((err) => { setError({ type: "danger", message: err.message }) })
  }, [])
  
  const displaySpinner = ["secondary", "success", "danger", "warning", "info", "dark"].map((variant, key) => {
    return (<Spinner animation="grow" variant={variant} key={key} className="m-1" />)
  })

  return (
    <div style={{ background: "#F7FAFF",minHeight:'90vh' }} className="pb-5">
      <MyNavbar link="/survey" title="Go To Survey" />
      <Container className="my-5 mb-0">

        {!_.isUndefined(lastXDaysAvgRating) && !_.isUndefined(lastXDaysResponses)
          && !_.isUndefined(hashtags) && !_.isUndefined(avgMoodRatingToday)
          && !_.isUndefined(lastYDaysCategoryAvg) ?
          <>
            <Slide left>
              <BoxesContainer
                lastXDaysAvgRating={lastXDaysAvgRating}
                lastXDaysResponses={lastXDaysResponses}
                avgMoodRatingToday={avgMoodRatingToday}
                hashtags={hashtags}
                pastDaysCount={defaultData.pastDaysCount} />
            </Slide>
            <Slide right>
              <GraphContainer
                lastXDaysAvgRating={lastXDaysAvgRating}
                lastYDaysCategoryAvg={lastYDaysCategoryAvg} />
            </Slide>
            <SurveyDataTable />
            <BadMoodRatings badMoodSince={defaultData.badMoodSince}/>
          </> : analysing ? <div className="text-center my-5">{displaySpinner}</div> :
            <Alert variant={error.type}>{error.message}</Alert>}
        </Container>
      </div>
  )
}


