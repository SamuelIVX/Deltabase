'use client';
/**
 * What-If investment inputs — initial/monthly amounts and time-horizon slider.
 */
import { useContext, useState } from "react";
import { MdLink, MdLinkOff } from "react-icons/md";
import styles from "./investmentform.module.css";
import * as Slider from "@radix-ui/react-slider";
import { AssetContext } from "@/components/whatif/assetselector/assetselector";

interface TimeSliderProps {
    value: number[];
    setValue: (v: number[]) => void;
    idPrefix?: string;
}

/**
 * Radix year-horizon slider (1–10) for What-If DCA backtest.
 */
function TimeSlider({ value, setValue, idPrefix = "slider" }: TimeSliderProps) {
    const years = value[0] || 1;
    const label = years === 1 ? 'Year' : 'Years';

    const QUICK_YEARS = [1, 3, 5, 10];

    return (
        <div className={styles.sliderWrapper}>
            <div className={styles.sliderHeader}>
                <span className={styles.sliderHeading}>Time Horizon</span>
                <span className={styles.sliderLabel}>{years} {label}</span>
            </div>

            <div className={styles.quickYears}>
                {QUICK_YEARS.map((y) => (
                    <button
                        key={`${idPrefix}-${y}`}
                        type="button"
                        className={`${styles.yearBtn} ${years === y ? styles.yearBtnActive : ''}`}
                        onClick={() => setValue([y])}
                        aria-pressed={years === y}
                    >
                        {y}Y
                    </button>
                ))}
            </div>

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
        </div>
    );
}

/**
 * Form controls for initial/monthly investment and time horizon (reads AssetContext).
 * Provides one-click synchronization between assets for direct comparisons.
 * @returns {JSX.Element}
 */
const InvestmentForm = () => {
    const {
        value1, setValue1,
        initialInvestment1, setInitialInvestment1,
        monthlyInvestment1, setMonthlyInvestment1,
        value2, setValue2,
        initialInvestment2, setInitialInvestment2,
        monthlyInvestment2, setMonthlyInvestment2,
        selectedAsset1, selectedAsset2
    } = useContext(AssetContext);

    const [isLinked, setIsLinked] = useState(true);

    const handleInitial1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInitialInvestment1(val);
        if (isLinked) {
            setInitialInvestment2(val);
        }
    };

    const handleMonthly1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMonthlyInvestment1(val);
        if (isLinked) {
            setMonthlyInvestment2(val);
        }
    };

    const handleInitial2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInitialInvestment2(val);
        if (isLinked) {
            setInitialInvestment1(val);
        }
    };

    const handleMonthly2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMonthlyInvestment2(val);
        if (isLinked) {
            setMonthlyInvestment1(val);
        }
    };

    const handleTime1 = (v: number[]) => {
        setValue1(v);
        if (isLinked) {
            setValue2(v);
        }
    };

    const handleTime2 = (v: number[]) => {
        setValue2(v);
        if (isLinked) {
            setValue1(v);
        }
    };

    const asset1Name = selectedAsset1?.symbol || 'Asset 1';
    const asset2Name = selectedAsset2?.symbol || 'Asset 2';

    return (
        <div className={styles.section}>
            {/* Control Bar: Link Toggle */}
            <div className={styles.controlBar}>
                <div className={styles.controlTitleGroup}>
                    <h2 className={styles.controlTitle}>DCA Strategy Allocation</h2>
                    <span className={styles.controlSubtitle}>
                        Model recurring monthly contributions and lump-sum capital
                    </span>
                </div>
                <button
                    type="button"
                    className={`${styles.linkToggle} ${isLinked ? styles.linkToggleActive : ''}`}
                    onClick={() => {
                        const nextLinked = !isLinked;
                        setIsLinked(nextLinked);
                        if (nextLinked) {
                            setInitialInvestment2(initialInvestment1);
                            setMonthlyInvestment2(monthlyInvestment1);
                            setValue2(value1);
                        }
                    }}
                    aria-pressed={isLinked}
                >
                    <span className={styles.linkIcon} aria-hidden="true">
                        {isLinked ? <MdLink size={16} /> : <MdLinkOff size={16} />}
                    </span>
                    <span>{isLinked ? 'Equal Strategy (Linked)' : 'Custom per Asset'}</span>
                </button>
            </div>

            <div className={styles.wrapper}>
                {/* Form 1 */}
                <div className={`${styles.container} ${styles.containerAsset1}`}>
                    <div className={styles.formCardHeader}>
                        <span className={styles.dotAsset1} aria-hidden="true" />
                        <span className={styles.cardHeaderTitle}>{asset1Name} Strategy</span>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="initialInvestment1">
                            Initial Investment for Asset 1
                        </label>
                        <div className={styles.inputBg}>
                            <span className={styles.currencyPrefix}>$</span>
                            <input
                                id="initialInvestment1"
                                className={styles.input}
                                type="text"
                                inputMode="numeric"
                                value={initialInvestment1}
                                onChange={handleInitial1}
                                placeholder="1000"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="monthlyInvestment1">
                            Monthly Investment for Asset 1
                        </label>
                        <div className={styles.inputBg}>
                            <span className={styles.currencyPrefix}>$</span>
                            <input
                                id="monthlyInvestment1"
                                className={styles.input}
                                type="text"
                                inputMode="numeric"
                                value={monthlyInvestment1}
                                onChange={handleMonthly1}
                                placeholder="250"
                            />
                        </div>
                    </div>

                    <TimeSlider value={value1} setValue={handleTime1} idPrefix="asset1" />
                </div>

                {/* Form 2 */}
                <div className={`${styles.container} ${styles.containerAsset2}`}>
                    <div className={styles.formCardHeader}>
                        <span className={styles.dotAsset2} aria-hidden="true" />
                        <span className={styles.cardHeaderTitle}>{asset2Name} Strategy</span>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="initialInvestment2">
                            Initial Investment for Asset 2
                        </label>
                        <div className={styles.inputBg}>
                            <span className={styles.currencyPrefix}>$</span>
                            <input
                                id="initialInvestment2"
                                className={styles.input}
                                type="text"
                                inputMode="numeric"
                                value={initialInvestment2}
                                onChange={handleInitial2}
                                placeholder="1000"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="monthlyInvestment2">
                            Monthly Investment for Asset 2
                        </label>
                        <div className={styles.inputBg}>
                            <span className={styles.currencyPrefix}>$</span>
                            <input
                                id="monthlyInvestment2"
                                className={styles.input}
                                type="text"
                                inputMode="numeric"
                                value={monthlyInvestment2}
                                onChange={handleMonthly2}
                                placeholder="250"
                            />
                        </div>
                    </div>

                    <TimeSlider value={value2} setValue={handleTime2} idPrefix="asset2" />
                </div>
            </div>
        </div>
    );
};

export default InvestmentForm;
