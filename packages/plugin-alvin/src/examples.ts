import { ActionExample } from "@elizaos/core";

export const getMarsRoverExample: ActionExample[][]=[
    [
        {
            user:"{{user1}}",
            content:{
                text:"I wonder what mars looks like today?",
            }
        },
        {
            user:"{{agent}}",
            content:{
                text:"Let me fetch a picture from a mars rover.",
                action:"NASA_GET_MARS_ROVER_PHOTO",
            }
        }
    ],
    [
        {
            user:"{{user1}}",
            content:{
                text:"Can you fetch a random picture of Mars?",
            }
        },
        {
            user:"{{agent}}",
            content:{
                text:"Let me fetch a picture from a mars rover.",
                action:"NASA_GET_MARS_ROVER_PHOTO",
            }
        }
    ]
]

export const getAPODExample: ActionExample[][]=[
    [
        {
            user:"{{user1}}",
            content:{
                text:"What's the nasa Astronomy picture of the day?",
            }
        },
        {
            user:"{{agent}}",
            content:{
                text:"Let me get the nasa image of the day.",
                action:"NASA_GET_APOD",
            }
        }
    ],
    [
        {
            user:"{{user1}}",
            content:{
                text:"I love space",
            }
        },
        {
            user:"{{agent}}",
            content:{
                text:"Oh really, then let me get the nasa image of the day to make your day even better.",
                action:"NASA_GET_APOD",
            }
        }
    ],
    [
        {
            user:"{{user1}}",
            content:{
                text:"I am in love with space and space travel",
            }
        },
        {
            user:"{{agent}}",
            content:{
                text:"Space is beautiful, dark, scary, and cast. Would you like to see a current photo of space from NASA?"
            }
        },        {
            user:"{{user1}}",
            content:{
                text:"yes",
            }
        },
        {
            user:"{{agent}}",
            content:{
                text:"Here is the NASA Astronomy Picture of the Day.",
                action:"NASA_GET_APOD",
            }
        }
    ]
]

export const getCosmosDataExample: ActionExample[][]=[
    [
        {
            user:"{{user1}}",
            content:{
                text:"Get earth photo for email nhatlapross@gmail.com?",
            }
        },
        {
            user:"{{agent}}",
            content:{
                text:"Here's your earth photo send to email nhatlapross@gmail.com.",
                action:"ORACLE_GET_COSMOS_DATA",
            }
        }
    ],
    [
        {
            user:"{{user1}}",
            content:{
                text:"Can you send earth photo to email nhatlapross@gmail.com?",
            }
        },
        {
            user:"{{agent}}",
            content:{
                text:"Let me give email nhatlapross@gmail.com earth photo.",
                action:"ORACLE_GET_COSMOS_DATA",
            }
        }
    ]
]