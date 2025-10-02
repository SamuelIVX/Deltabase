'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../markets.module.css';
import { createContext, useContext } from 'react'

const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];

export const MarketContext = createContext({
    selectedStock: "",
    setSelectedStock: (value: string) => { },
});

const StockMarketChart = () => {
    const { selectedStock, setSelectedStock } = useContext(MarketContext);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>Currently Showing: </span>

                <span className={styles.search}>
                    <input
                        className={styles.input}
                        type='text'
                        placeholder="Enter a stock symbol..."
                        value={selectedStock || ''}
                        onChange={(e) => {
                            setSelectedStock(e.target.value)
                        }}
                    />
                </span>
            </div>


            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>

        </div>
    );
};

export default StockMarketChart;