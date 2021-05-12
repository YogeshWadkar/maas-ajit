var server = require("./server");
var chalk = require("chalk");
var app = require("./server");

var ds = server.dataSources.db;

async function createSlots() {
  var cnt = await app.models.Slot.generate();
  console.log(chalk.green.bold("Total slots generated: "), cnt);

  ds.disconnect();
}

createSlots();
