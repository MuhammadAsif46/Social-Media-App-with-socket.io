// Import Libraries:
import { MongoClient } from 'mongodb';      
import OpenAI from 'openai';                

//define uri mongodb cluster
const uri = "mongodb+srv://dbuser:dbpassword@cluster0.ovydsoh.mongodb.net/?retryWrites=true&w=majority";
export const client = new MongoClient(uri);


// create function to execute when connection is established
async function run() {      
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

// close app
process.on("SIGINT", async function(){      
    console.log("app is terminating");
    await client.close();
    process.exit(0);
});

// openai key 
export const openai = new OpenAI({          
    apiKey: process.env.OPENAI_API_KEY,
});