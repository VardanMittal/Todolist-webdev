const express = require('express');
const date = require(__dirname+'/date.js');
const app = express();


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = ["Wake up", "Kill", "sleep"];
let workItems = [];
app.get("/", function (req, res) {
    
    res.render("list", { listTitle: date(), newListItem: items });
});

app.post("/", function (req, res) {
    if (req.body.list === "Work") {
        workItems.push(req.body.newItem);
        res.redirect("/work");
    } else {
        items.push(req.body.newItem);
        res.redirect("/");
    }
});


app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItem: workItems });
});

app.listen(3000, function () {
    console.log("Server is started on port 3000");
});