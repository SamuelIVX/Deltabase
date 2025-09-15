'use client'
import styles from "./investmentform.module.css";
import * as Slider from "@radix-ui/react-slider"
import { useContext } from "react"
import { AssetContext } from "@/components/whatif/assetselector/assetselector";

function TimeSlider() {
  const { value, setValue } = useContext(AssetContext);

  const years = value[0];
  const label = years === 1 ? 'Year' : 'Years';

  return (
    <>
      <Slider.Root
        value={value}
        onValueChange={setValue}
        min={1}
        max={10}
        step={1}
        className={styles.SliderRoot}
      >
        <Slider.Track className={styles.SliderTrack}>
          <Slider.Range className={styles.SliderRange} />
        </Slider.Track>
        <Slider.Thumb className={styles.SliderThumb} aria-label="Years" />
      </Slider.Root>

      <p className={styles.label}> {years} {label}</p>
    </>
  );
}

const InvestmentForm = () => {

  const {
    initialInvestment,
    setInitialInvestment,
    monthlyInvestment,
    setMonthlyInvestment
  } = useContext(AssetContext);

  const handleInitial = (e) => {
    setInitialInvestment(e.target.value);
  }

  const handleMonthly = (e) => {
    setMonthlyInvestment(e.target.value);
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.container}>

          <div className={styles.field}>
            <label className={styles.label}>Initial Investment:</label>
            <div className={styles.inputBg}>
              <input
                className={styles.input}
                type="text"
                value={initialInvestment}
                onChange={handleInitial}
                placeholder="Value here..."
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Monthly Investment:</label>
            <div className={styles.inputBg}>
              <input
                className={styles.input}
                type="text"
                value={monthlyInvestment}
                onChange={handleMonthly}
                placeholder="Value here..."
              />
            </div>
          </div>

        </div>

        <div className={styles.slider}>
          <label className={styles.sliderLabel}>How long do you plan to invest in these stocks?</label>
          <TimeSlider />
        </div>

      </div>
    </>
  )
}

export default InvestmentForm;