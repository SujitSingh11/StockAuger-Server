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
//import { ResponsiveLine } from "@nivo/line";

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
    [theme.breakpoints.down("md")]: {
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
  console.log(data);
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
          {data.map((row) => (
            <StyledTableRow key="asd">
              <StyledTableCell component="th" scope="row">
                {row.date.slice(0, 10)}
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
          ))}
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

  const [dataToggle, setDataToggle] = useState(false);
  const [predictToggle, setPredictToggle] = useState(false);

  const classes = useStyles();

  const handleGetData = async (ticker, dataPeriod) => {
    const data = { ticker, period, dataPeriod };
    try {
      const apiData = await api.post("/getData", data);
      console.log(apiData);
      setStockData(apiData.data);
      setDataToggle(false);
      setPredictToggle(true);
    } catch (error) {
      console.error(error);
    }
    setPredictToggle(false);
    setDataToggle(true);
  };

  const handlePredict = async (ticker, period, dataPeriod) => {
    const data = { ticker, period, dataPeriod };
    try {
      const apiData = await api.post("/getForecast", data);
      console.log(apiData);
      setDataToggle(false);
      setPredictToggle(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClear = () => {
    setTicker("");
    setPeriod(0);
    setDataPeriod("");
    setDataToggle(false);
    setPredictToggle(false);
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
        {dataToggle ? <DataTable data={stockData} /> : <></>}
        {predictToggle ? <>Predition</> : <></>}
      </Container>
    </div>
  );
};

export default App;
