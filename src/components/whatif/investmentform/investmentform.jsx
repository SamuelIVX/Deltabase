'use client'
import styles from "./investmentform.module.css";
import * as Slider from "@radix-ui/react-slider"
import { useContext } from "react"
import { AssetContext } from "@/components/whatif/assetselector/assetselector";

function TimeSlider({ value, setValue }) {
  const years = value[0];
  const label = years === 1 ? 'Year' : 'Years';

  return (
    <div className={styles.sliderWrapper}>
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
      <p className={styles.sliderLabel}>{years} {label}</p>
    </div>
  );
}

const InvestmentForm = () => {
  const {
    value1, setValue1,
    initialInvestment1, setInitialInvestment1,
    monthlyInvestment1, setMonthlyInvestment1,
    value2, setValue2,
    initialInvestment2, setInitialInvestment2,
    monthlyInvestment2, setMonthlyInvestment2
  } = useContext(AssetContext);

  const handleInitial1 = (e) => setInitialInvestment1(e.target.value);
  const handleMonthly1 = (e) => setMonthlyInvestment1(e.target.value);

  const handleInitial2 = (e) => setInitialInvestment2(e.target.value);
  const handleMonthly2 = (e) => setMonthlyInvestment2(e.target.value);

  return (
    <div className={styles.wrapper}>
      {/* Form 1 */}
      <div className={styles.container} >
        <div className={styles.field}>
          <label className={styles.label}>Initial Investment for Asset 1</label>
          <div className={styles.inputBg}>
            <input
              className={styles.input}
              type="text"
              value={initialInvestment1}
              onChange={handleInitial1}
              placeholder="Value here..."
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Monthly Investment for Asset 1</label>
          <div className={styles.inputBg}>
            <input
              className={styles.input}
              type="text"
              value={monthlyInvestment1}
              onChange={handleMonthly1}
              placeholder="Value here..."
            />
          </div>
        </div>

        <TimeSlider value={value1} setValue={setValue1} />
      </div>

      {/* Form 2 */}
      <div className={styles.container}>
        <div className={styles.field}>
          <label className={styles.label}>Initial Investment for Asset 2</label>
          <div className={styles.inputBg}>
            <input
              className={styles.input}
              type="text"
              value={initialInvestment2}
              onChange={handleInitial2}
              placeholder="Value here..."
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Monthly Investment for Asset 2</label>
          <div className={styles.inputBg}>
            <input
              className={styles.input}
              type="text"
              value={monthlyInvestment2}
              onChange={handleMonthly2}
              placeholder="Value here..."
            />
          </div>
        </div>

        <TimeSlider value={value2} setValue={setValue2} />
      </div>
    </div >
  )
}

export default InvestmentForm;
