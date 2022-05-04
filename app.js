
// Requiring the express module, bodyParser module, lodash module and mongoose module
const express = require("express");
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const _ = require("lodash");

// Creating the express object using the app and setting it up
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

// Process of eastablishing the mongodb connection and database

const itemSchema = new mongoose.Schema( {       // Creating of Schema
    itemName: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

// Creating the Collections and required models
const itemModel = mongoose.model("todoitem", itemSchema);  
const listModel = mongoose.model("List", listSchema);

// Creating some data for todoitems collection 
work1 = new itemModel({itemName: "read a book"});
work2 = new itemModel({itemName: "Do make web development project"});
work3 = new itemModel({itemName: "Do make notes"});

// Creating the default array for storing the data created above
const workDataArray = [work1, work2, work3];

// Making the get request
app.get("/", (req, res) => {
    itemModel.find({}, (err, newListitems) => {
        if (newListitems.length === 0) {
            itemModel.insertMany(workDataArray, (err) => {
                if (err) {
                    console.log(err);
                }
            })
            res.redirect("/");
        }
        else {
            res.render("list",{title: "Today" ,task: newListitems});
        }
    })

});

// Making the custom route
app.get("/:routeParameter", (req, res) => {
    const routeParameter = _.capitalize(req.params.routeParameter);


    listModel.findOne({name: routeParameter}, (err, docs) => {
        if (docs) {
            res.render("list", {title: routeParameter, task: docs.items});
        } else {
            // Creating the document for routeParameters
            list = new listModel({
                name: routeParameter,
                items: workDataArray
            });
            list.save((err) => {
                if (!err) {
                    res.redirect("/" + routeParameter);
                }
            });
        }
    })
})

// Making the post request code for entering the items in the todo list
app.post("/", (req, res) => {
    const itemObject = new itemModel({
        itemName: req.body.listItems
    });

    if (req.body.submit === "Today") {
        itemObject.save();    
        res.redirect('/');
    } else {
        listModel.findOne({name: req.body.submit}, (err, docs) => {
            if (!err) {
                docs.items.push(itemObject);
                docs.save(err => res.redirect("/" + req.body.submit));
            }
        })
    }
})

// To remove the favicon warning....
app.get("/favicon.ico", function(req, res){
    res.sendStatus(204);
});

// code for post request while removing the items in the todo list
app.post("/remove", (req, res) => {
    const removeItemsId = req.body.removeItems;
    const listItem = req.body.itemList;

    if (listItem === "Today") {
        itemModel.findByIdAndRemove(removeItemsId, (err) => {
            if(err) {
                console.log(err);
            }
        });
        res.redirect("/");
    } else {
        listModel.findOneAndUpdate({name: listItem}, {$pull: {items: {_id: removeItemsId}}}, (err, docs) => {
            if (err) {
                console.log(err);
            }
        });
        res.redirect("/" + listItem);
    }

})

let port = process.env.PORT;
if (port == "" || port == null) {
    port = 3000;
}

mongoose.connect("mongodb+srv://PankajSingh:Pankaj%401003@cluster0.8o0wu.mongodb.net/todolist?retryWrites=true&w=majority", {useNewUrlParser: true}).then(() => {
    app.listen(port, () => console.log("Server has started file system"));
}).catch((error) => {
    console.log(error);
});
