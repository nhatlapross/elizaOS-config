import { elizaLogger } from "@elizaos/core";
import {
    APODResponse,
    MarsRoverDataResponse,
    CosmosDataResponse
 } from "./types";

 import { MongoClient } from 'mongodb';

 const BASE_URL = "https://api.nasa.gov/planetary/apd\?api_key\=";

 export const createNASAService = (apiKey: string) => {
    const getAPOD = async (): Promise<APODResponse> => {
        if(!apiKey) throw new Error("NASA API key is required");
        try{
            const url = BASE_URL + apiKey;
            const response = await fetch(url);
            if(!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }
            const data = await response.json();
            return data;
        }
        catch(error) {
            throw new Error(error.message);
        }
    }

    const getMarsRoverPhoto = async (): Promise<MarsRoverDataResponse> => {
        if(!apiKey) throw new Error("NASA API key is required");
        try{
            const data = await fetchMarsPhotos(apiKey);
            return data;
        }
        catch(error) {
            throw new Error(error.message);
        }
    }

    // const getCosmosData = () => {
    //     // Return some dummy data for testing
    //     return {
    //         message: "This is cosmos data from Oracle",
    //         timestamp: new Date().toISOString()
    //     };
    // }



    const getCosmosData = async () => {
        return {
            mabn: "14002475",
            hoten: "Test Patient",
            ngaysinh: "1980-01-01",
            // other fields as needed
          };
    }

    return {
        getAPOD,
        getMarsRoverPhoto,
        getCosmosData
    };
 };

 async function fetchMarsPhotos(apiKey, attempts = 0, maxAttemps = 10){
   try {
      const curiosityCameras = [
        'FHAZ',
        'RHAZ',
        'MAST',
        'CHEMCAM',
        'NAVCAM',
        'MARDI',
        'MAHLI'
      ]
      const opportunityCameras = [
        'FHAZ',
        'RHAZ',
        'PANCAM',
        'MINITES'
      ]
      const CURIOUSITY_MAX_SOL = 3400;
      const OPPORTUNITY_MAX_SOL = 4500;
      const rovers = {
        curiosity: {
          cameras: curiosityCameras,
          maxSol: CURIOUSITY_MAX_SOL
        },
        // opportunity: {
        //   cameras: opportunityCameras,
        //   maxSol: OPPORTUNITY_MAX_SOL
        // }
      }

        const roverNames = Object.keys(rovers);
        const randomRover = roverNames[Math.floor(Math.random() * roverNames.length)];
        const selectedRover = rovers[randomRover as keyof typeof rovers];

        const randomCamera = selectedRover.cameras[Math.floor(Math.random() * selectedRover.cameras.length)];
        const randomSol = Math.floor(Math.random() * selectedRover.maxSol) + 1;

        const requestURL = `https://api.nasa.gov/mars-photos/api/v1/rovers/${randomRover}/photos?sol=${randomSol}&camera=${randomCamera}&api_key=${apiKey}`;
        console.log('requestURL::::',requestURL);
        const response = await fetch(requestURL);
        const data = await response.json();

        if(data.photos.length) {
           const returnObj = {
                photo: data.photos[0].img_src,
                sol: randomSol,
                camera: randomCamera,
                rover: randomRover
           }
           return returnObj;
        } else if (attempts < maxAttemps) {
            return fetchMarsPhotos(apiKey, attempts + 1, maxAttemps);
        }
        else {
            throw new Error('Failed to fetch Mars photos');
        }
    }
    catch(error) {
         if(attempts < maxAttemps) {
              return fetchMarsPhotos(apiKey, attempts + 1);
         }
         throw new Error(error.message);
    }
}