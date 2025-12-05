var express = require("express");
const {MongoClient} = require("mongodb");
var app = express();
var port = process.env.PORT || 3000;
var uri = "mongodb+srv://keremozturk_db_user:krm2005dnz@nosqlpractice.2dd9pek.mongodb.net/Stock?retryWrites=true&w=majority";


// home page search form
app.get("/", (req, res) => {
    res.send(`
        <h1>Stock Ticker App </h1>
        <form method="GET" action="/process">
            <label>Enter Company Name or Ticker</label>
            <input type="text" name="search" required>
            <br><br>
            <input type="radio" name="type" value="company">Company
            <input type="radio" name="type" value="ticker">Ticker
            <br><br>
            <button type="submit">Search</button>
        </form>
        `);
});

// process the user search
app.get("/process", async (req, res) =>{
    var searchVal = req.query.search; // user text
    var searchType = req.query.type; // company or ticker

    const client = new MongoClient(uri);
    try{
        await client.connect();
        var db = client.db("Stock");
        var collection = db.collection("PublicCompanies");
        var query;

        // build the query based on the input from the user
        if(searchType == "ticker"){
            query = {ticker: searchVal};
        }
        else{
            query = {company: searchVal};
        }

        // run query and convert it to array
        var results = await collection.find(query).toArray();

        // print to console
        results.forEach(item => {
            console.log(item.company, item.ticker, item.price);
        });

        // display in web
        let item_list = "";
        results.forEach(item => {
            item_list += `<p>${item.company} - ${item.ticker} - $${item.price}</p>`;
        });

        // send results page
        res.send(`
            <h1>Search Results</h1>
            <p>${results.length} results.</p>
            ${item_list}
            <a href="/">Go back to Search</a>
            `);
    }
    catch (err){
        console.log("Error occured", err);
        res.send("Error connecting to database");
    }
    await client.close();
});
app.listen(port, () => {
    console.log("Server on http://localhost:" + port);
});