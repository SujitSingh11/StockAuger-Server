import React, { useState } from "react";
import "fontsource-roboto";
import axios from "axios";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Container,
  Grid,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@material-ui/core";

import Moment from "react-moment";
import "moment-timezone";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

const api = axios.create({
  baseURL: "http://localhost:80/api/",
  headers: { Accept: "application/json" },
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  rootGrid: {
    marginTop: theme.spacing(2),
  },
  lable: {
    display: "block",
    marginBottom: "12px",
    marginLeft: "2px",
    color: theme.palette.grey[500],
  },
  tickerInput: {
    width: "90%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  buttonGrid: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(4),
  },
  button: {
    marginRight: "20px",
  },
  table: {
    marginTop: theme.spacing(4),
    height: "500px",
  },
}));

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const DataTable = ({ data }) => {
  const classes = useStyles();
  return (
    <TableContainer className={classes.table} component={Paper}>
      <Table aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell align="center">Low</StyledTableCell>
            <StyledTableCell align="center">High</StyledTableCell>
            <StyledTableCell align="center">Open</StyledTableCell>
            <StyledTableCell align="center">Close</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => {
            return (
              <StyledTableRow key={index}>
                <StyledTableCell component="th" scope="row">
                  <Moment format="DD/MM/YYYY">{row.date}</Moment>
                </StyledTableCell>
                <StyledTableCell align="center">
                  {row.low.toFixed(4)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {row.high.toFixed(4)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {row.close.toFixed(4)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {row.close.toFixed(4)}
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const App = () => {
  const [ticker, setTicker] = useState("");
  const [period, setPeriod] = useState(30);
  const [dataPeriod, setDataPeriod] = useState("1y");
  const [stockData, setStockData] = useState({});
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);

  const [dataToggle, setDataToggle] = useState(false);
  const [predictToggle, setPredictToggle] = useState(false);

  const classes = useStyles();

  const handleGetData = async (ticker, dataPeriod) => {
    const data = { ticker, period, dataPeriod };
    try {
      setIsError(false);
      const apiData = await api.post("/getData", data);
      console.log(apiData);
      // eslint-disable-next-line no-throw-literal
      if (apiData.data.length === 0) throw "Ticker not found or incorrect.";
      setStockData(apiData.data);
      setPredictToggle(false);
      setDataToggle(true);
    } catch (error) {
      setIsError(true);
      setError("Ticker not found or incorrect.");
      setPredictToggle(false);
      setDataToggle(false);
    }
  };

  const handlePredict = async (ticker, period, dataPeriod) => {
    const data = { ticker, period, dataPeriod };
    try {
      // eslint-disable-next-line no-throw-literal
      setIsError(false);
      setDataToggle(false);
      setPredictToggle(true);
      const apiData = await api.post("/getForecast", data);
      console.log(apiData.data);
      let chart = am4core.create("chartdiv", am4charts.XYChart);
      chart.paddingRight = 20;

      chart.data = apiData.data;

      let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.renderer.minWidth = 35;

      let series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = "date";
      series.dataFields.valueY = "close";

      series.tooltipText = "{valueY}";
      chart.cursor = new am4charts.XYCursor();

      let scrollbarX = new am4charts.XYChartScrollbar();
      scrollbarX.series.push(series);
      chart.scrollbarX = scrollbarX;
      let range = dateAxis.axisRanges.create();
      range.date = new Date();
      range.grid.stroke = am4core.color("red");
      range.grid.strokeWidth = 2;
      range.grid.strokeOpacity = 1;
    } catch (error) {
      setIsError(true);
      if (period === "" && ticker === "") {
        setError("Ticker & Prediction field not mentioned.");
      } else if (period === "") {
        setError("Prediction field not mentioned.");
      } else {
        setError("Ticker not found or incorrect.");
      }
      setPredictToggle(false);
      setDataToggle(false);
    }
  };

  const handleClear = () => {
    setTicker("");
    setPeriod(0);
    setDataPeriod("");
    setDataToggle(false);
    setPredictToggle(false);
    setError("");
    setIsError(false);
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="md">
        <Grid container className={classes.rootGrid}>
          <Grid xl={12} lg={12} md={12} sm={12} item>
            <Typography variant="h2" component="h2" gutterBottom>
              StockAuger
            </Typography>
          </Grid>
          <Grid xl={4} lg={4} md={12} sm={12} item>
            <lable className={classes.lable} for="Ticker">
              Enter Ticker (eg. AAPL)
            </lable>
            <TextField
              id="Ticker"
              label="Ticker"
              variant="outlined"
              size="small"
              type="text"
              value={ticker}
              onChange={(event) => setTicker(event.target.value)}
              className={classes.tickerInput}
            />
          </Grid>
          <Grid xl={4} lg={4} md={12} sm={12} item>
            <lable className={classes.lable} for="DataPeriod">
              Enter Data Period (eg. 1y,2y,5y)
            </lable>
            <TextField
              id="DataPeriod"
              label="Data Period"
              variant="outlined"
              size="small"
              type="text"
              value={dataPeriod}
              onChange={(event) => setDataPeriod(event.target.value)}
              className={classes.tickerInput}
            />
          </Grid>
          <Grid xl={4} lg={4} md={12} sm={12} item>
            <lable className={classes.lable} for="Predition">
              Enter Predition Time (eg. 30,60)
            </lable>
            <TextField
              id="Predition"
              label="Predition Time"
              variant="outlined"
              size="small"
              type="number"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className={classes.tickerInput}
            />
          </Grid>
          <Grid
            xl={12}
            lg={12}
            md={12}
            sm={12}
            className={classes.buttonGrid}
            item
          >
            <Button
              variant="outlined"
              color="primary"
              className={classes.button}
              onClick={() => handleGetData(ticker, dataPeriod)}
            >
              Get Ticker Data
            </Button>
            <Button
              variant="outlined"
              color="primary"
              className={classes.button}
              onClick={() => handlePredict(ticker, period, dataPeriod)}
            >
              Predict
            </Button>
            <Button
              variant="outlined"
              color="primary"
              className={classes.button}
              onClick={() => handleClear()}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
        {isError ? <>{error}</> : <></>}
        {dataToggle ? <DataTable data={stockData} /> : <></>}
        {predictToggle ? (
          <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
        ) : (
          <></>
        )}
      </Container>
    </div>
  );
};

export default App;
