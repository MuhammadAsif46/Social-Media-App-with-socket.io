import { MongoClient } from 'mongodb';      // import MongoClient in mongodb
import OpenAI from 'openai';                // import OpenAI in openai

const uri = "mongodb+srv://dbuser:dbpassword@cluster0.ovydsoh.mongodb.net/?retryWrites=true&w=majority";
export const client = new MongoClient(uri);   //define uri mongodb cluster


async function run() {      // create function to execute when connection is established
    try {
        await client.connect();
        console.log("Successfully connected to Atlas");
    } catch (err) {
        console.log(err.stack);
        await client.close();
        process.exit(1);
    }
}
run().catch(console.dir);

process.on("SIGINT", async function(){      // close app
    console.log("app is terminating");
    await client.close();
    process.exit(0);
});


export const openai = new OpenAI({          // openai key 
    apiKey: process.env.OPENAI_API_KEY,
});