"use client";
import React from 'react';
import { MoonLoader } from 'react-spinners';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';
import styles from "./chart1.module.css"
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import useYahooHistoricalData from '@/hooks/useYahooHistoricalData';
import useSimulateDCA from '@/hooks/useSimulateDCA';

const Chart2 = () => {
  const { selectedAsset2, value, initialInvestment, monthlyInvestment } = React.useContext(AssetContext);
  const { results, isLoading, error } = useYahooHistoricalData(selectedAsset2?.symbol, value[0]);

  const currentMonth = new Date().getMonth();

  const dcaResults = useSimulateDCA(results, initialInvestment, monthlyInvestment);
  const chartData = dcaResults.monthlyPortfolio;

  // Filter to only show ticks for the current month
  const customTicks = chartData
    .filter(item => new Date(item.name).getMonth() === currentMonth)
    .map(item => item.name);

  return (
    <div className={styles.chartWrapper} style={{ position: 'relative', width: '100%', height: '400px' }}>
      {error && <p className={styles.message}>Error: {error}</p>}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <MoonLoader color="#dc3545" size={100} />
        </div>
      )}

      {selectedAsset2 && results && (
        <div className={styles.container}>
          <h2 className={styles.title}>{selectedAsset2 ? selectedAsset2.symbol : 'Asset 2'}</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              width={800}
              height={400}
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="name"
                ticks={customTicks}
                tickFormatter={(value) => {
                  return value;
                }}
              />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke="rgba(220, 53, 69, 0.7)"
                fill="rgba(220, 53, 69, 0.3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
};

export default Chart2;