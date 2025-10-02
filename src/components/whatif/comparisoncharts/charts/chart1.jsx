"use client";
import React from 'react';
import { MoonLoader } from 'react-spinners';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from "./charts.module.css"
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import useYahooHistoricalData from '@/hooks/useYahooHistoricalData';
import useSimulateDCA from '@/hooks/useSimulateDCA';
import useTooltipData from '../../../../hooks/useTooltipData';

const Chart1 = () => {
  const { selectedAsset1, value1, initialInvestment1, monthlyInvestment1, setAsset1Data } = React.useContext(AssetContext);
  const { results, isLoading, error } = useYahooHistoricalData(selectedAsset1?.symbol, value1[0]);

  const currentMonth = new Date().getMonth();

  const dcaResults = useSimulateDCA(results, initialInvestment1, monthlyInvestment1);
  const chartData = dcaResults.monthlyPortfolio;

  React.useEffect(() => {
    if (chartData && chartData.length > 0) {
      setAsset1Data(chartData);
    }
  }, [chartData, setAsset1Data]);

  // Filter to only show ticks for the current month
  const customTicks = chartData
    .filter(item => new Date(item.name).getMonth() === currentMonth)
    .map(item => item.name);

  const CustomTooltip = ({ active, payload, label, data }) => {
    const tooltipData = useTooltipData(active, payload, data);

    if (!tooltipData) return null;

    const { label: date, formattedValue, performance } = tooltipData;
    const performanceColor = performance > 0 ? 'green' : performance < 0 ? 'red' : 'black';

    return (
      <div className={styles.customTooltip} style={{ background: 'rgba(0, 123, 255, 0.20)' }}>
        <p className={styles.description}>Current Date</p>
        <p className={styles.value}>{date}</p>

        <p className={styles.description}>Portfolio Value</p>
        <p className={styles.value}>${formattedValue}</p>

        {performance !== null && (
          <>
            <p className={styles.description}>Performance</p>
            <p className={styles.value} style={{ color: performanceColor }}>{performance}%</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={styles.chartWrapper} style={{ position: 'relative', width: '100%', height: '400px' }}>
      {error && <p className={styles.message}>Error: {error}</p>}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <MoonLoader color="#007bff" size={100} />
        </div>
      )}

      {selectedAsset1 && results && value1 && initialInvestment1 && monthlyInvestment1 && (
        <div className={styles.container}>
          <h2 className={styles.title}>{selectedAsset1 ? selectedAsset1.symbol : 'Asset 1'}</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              width={800}
              height={400}
              data={chartData}
              margin={{
                top: 10,
                right: 0,
                left: 30,
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
              <YAxis
                domain={[
                  (dataMin) => (dataMin * 0.995),
                  (dataMax) => dataMax * 1.005,
                ]}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip data={chartData} />} />
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke="rgba(0, 123, 255, 0.5)"
                fill="rgba(0, 123, 255, 0.15)" />
            </AreaChart>
          </ResponsiveContainer>

        </div>
      )}

    </div>
  );
};

export default Chart1;