import { elizaLogger } from "@elizaos/core";
import {
    ChongChiDinhThuocDataResponse
 } from "./types";

 export const createNASAService = (apiKey: string) => {
    // const getAPOD = async (): Promise<APODResponse> => {
    //     if(!apiKey) throw new Error("NASA API key is required");
    //     try{
    //         const url = BASE_URL + apiKey;
    //         const response = await fetch(url);
    //         if(!response.ok) {
    //             const error = await response.json();
    //             throw new Error(error?.message || response.statusText);
    //         }
    //         const data = await response.json();
    //         return data;
    //     }
    //     catch(error) {
    //         throw new Error(error.message);
    //     }
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
        getCosmosData
    };
 };