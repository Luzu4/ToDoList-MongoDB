//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://luz:1234@cluster0.zwcnyqt.mongodb.net/toDoListDB", {useNewUrlParser:true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1= new Item({
  name: "1st task"
});

const item3 = new Item({
  name: "Second task",
});

const item2 = new Item({
  name: "3rd task"
});

const defaultItems = [item1, item2, item3]

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = new mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find(function(err,foundItems){
    if(foundItems.length ===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log("Smth went wrong");
        }else{
          console.log("Successfully add default items");
        }
        res.render("list", {listTitle: "Today", newListItems: foundItems });
      });
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems });
    }
  })


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if(listName=== "Today"){
    item.save();
    res.redirect("/");
  }else{
    console.log(listName);
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});


app.post("/delete", function (req,res){
  const itemIdToDelete = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.deleteOne({"_id":itemIdToDelete},function(err){
      if(err){
        console.log("Smth went wrong with delete record")
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:itemIdToDelete}}},function (err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });

  }

})

app.get("/:customListName", function(req,res){

  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err, result){
    if(result ===null){
      const newList = new List({
        name: customListName,
        items: defaultItems
      });
      newList.save();
      res.redirect("/"+customListName);
      console.log("List Created")
    }else{
      console.log("Already exist");
      res.render("list", {listTitle: result.name, newListItems: result.items})
    }
  })


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
