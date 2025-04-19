const fhApiKey = process.env.REACT_APP_FINNHUB_API_KEY;

const Newsletter = () => {
    console.log(fhApiKey);

    return (
        <div>
            {process.env.REACT_APP_FINNHUB_API_KEY}
        </div>
    );
};

export default Newsletter;