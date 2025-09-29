"use client";
import React from 'react';
import { MoonLoader } from 'react-spinners';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';
import styles from "./chart1.module.css"
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import useYahooHistoricalData from '@/hooks/useYahooHistoricalData';
import useSimulateDCA from '@/hooks/useSimulateDCA';

const Chart1 = () => {
  const { selectedAsset1, value, initialInvestment, monthlyInvestment } = React.useContext(AssetContext);
  const { results, isLoading, error } = useYahooHistoricalData(selectedAsset1?.symbol, value[0]);


  const dcaResults = useSimulateDCA(results, initialInvestment, monthlyInvestment);
  const chartData = dcaResults.monthlyPortfolio;


  return (
    <div className={styles.chartWrapper} style={{ position: 'relative', width: '100%', height: '400px' }}>
      {error && <p className={styles.message}>Error: {error}</p>}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <MoonLoader color="#007bff" size={100} />
        </div>
      )}

      {selectedAsset1 && results && (
        <div className={styles.container}>
          <h2 className={styles.title}>{selectedAsset1 ? selectedAsset1.symbol : 'Asset 1'}</h2>
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
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="portfolioValue" stroke="rgba(0, 123, 255, 0.7)" fill="rgba(0, 123, 255, 0.3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
};

export default Chart1;