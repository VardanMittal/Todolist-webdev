const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');
// const date = require(__dirname + '/date.js');
const app = express();


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Reading"
});
const item2 = new Item({
    name: "Workout"
});
const item3 = new Item({
    name: "Coding"
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {
    Item.find({}, function (err, items) {
        if (items.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("success!!!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItem: items });
        }
    });

});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName,
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/")
    }else{
        List.findOne({name:listName}, function (err, foundList) {  
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }

});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "today"){
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successful deletion!!");
                res.redirect("/")
            }
        });
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function (err, foundList) { 
            if(!err){
                res.redirect("/"+ listName);
            }
         });
    }

});
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { listTitle: foundList.name, newListItem: foundList.items });
            };
        };
    });
});

app.listen(3000, function () {
    console.log("Server is started on port 3000");
});