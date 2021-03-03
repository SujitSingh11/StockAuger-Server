from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

import pandas as pd
import numpy as np
from fbprophet import Prophet
import yfinance as yf


app = FastAPI()


def getTickerForcast(ticker, period, dataPeriod):
    stockTicker = yf.Ticker(ticker)
    data = stockTicker.history(period=dataPeriod, interval="1d")
    df = pd.DataFrame({
        'ds': data.index.values,
        'y': data['Close'].values
    })
    m = Prophet(daily_seasonality=True)
    m.fit(df)
    future = m.make_future_dataframe(periods=period)
    prediction = m.predict(future)
    return prediction


def getTickerData(ticker, dataPeriod):
    stockTicker = yf.Ticker(ticker)
    data = stockTicker.history(period=dataPeriod, interval="1d")
    return pd.DataFrame({
        'date': data.index.values,
        'open': data['Open'].values,
        'high': data['High'].values,
        'low': data['Low'].values,
        'close': data['Close'].values
    })


class Stock(BaseModel):
    ticker: str
    period: Optional[int] = None
    dataPeriod: Optional[str] = "5y"


@app.post("/api/getData")
async def getData(stock: Stock):
    data = getTickerData(stock.ticker, stock.dataPeriod)
    return data


@app.post("/api/getForecast")
async def getForcast(stock: Stock):
    return getTickerForcast(stock.ticker, stock.period, stock.dataPeriod)
