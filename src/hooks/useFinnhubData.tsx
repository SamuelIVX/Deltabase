'use client'; 
import { useQuery } from '@tanstack/react-query';

// const finnhub_api_key = process.env.REACT_APP_FINNHUB_API_KEY;

const url = `https://finnhub.io/api/v1/news?category=general&token=cvnh48hr01qq3c7fa2vgcvnh48hr01qq3c7fa300`;

// interface FinnhubPost {
//     id: number,
//     category: string,
//     headline: string, 
//     image: string,
//     source: string,
//     summary: string,
//     url: string,
// }

const fetchFinnhubData = async() => {
    const response = await fetch(url);
    if(!response.ok) { throw new Error("Failed to fetch data.")}

    return await response.json();
}

const useFinnhubData = () => {

    return useQuery({
        queryKey: ['finnhub-news'],
        queryFn: fetchFinnhubData,
        staleTime: 1000 * 60 * 5 // 5 minutes cache
    })

    // const {data, isPending, isError, error} = useQuery({
    //     queryKey: ['finnhubData'],
    //     queryFn: fetchFinnhubData,
    // })

    // if(isPending) { return <div>Loading...</div> }
    // if(isError) { return <div>Error: {error.message}</div> }

    // return(
    //     <div>
    //         {data.map((post: FinnhubPost) => {
    //             return <div key={post.id}>{post.headline}</div>;
    //         })}
    //     </div>
    // )
};

export default useFinnhubData;
// export default fetchFinnhubData;