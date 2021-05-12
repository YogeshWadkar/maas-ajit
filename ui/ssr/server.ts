// These are important and needed before anything else
import "zone.js/dist/zone-node";

import "reflect-metadata";
var request = require("then-request");

var config = require("./src/app-config.json");
//var con = require("../../../maas/ui/ssr/src/views")
import { enableProdMode } from "@angular/core";

var ejs = require("ejs");
import * as express from "express";
import { join } from "path";
//import { ws } from "ws";

var path = require("path");
const uuidv4 = require("uuid/v4");
const PromiseType = require("bluebird");
const pdf = PromiseType.promisifyAll(require("html-pdf"));

var ws = require('ws');

// var screenshot = require("node-server-screenshot");

const HTMLDecoderEncoder = require("html-encoder-decoder");

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), "dist");

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {
  AppServerModuleNgFactory,
  LAZY_MODULE_MAP
} = require("./dist/server/main");

// Express Engine
import { ngExpressEngine } from "@nguniversal/express-engine";
// Import module map for lazy loading
import { provideModuleMap } from "@nguniversal/module-map-ngfactory-loader";

import { readFileSync } from "fs";
import { renderModuleFactory } from "@angular/platform-server";
import { from } from 'rxjs';
const template = readFileSync(
  join(DIST_FOLDER, "browser/index.html")
).toString();

app.engine("html", (_, options, callback) => {
  renderModuleFactory(AppServerModuleNgFactory, {
    document: template,
    url: options.req.url,
    extraProviders: [provideModuleMap(LAZY_MODULE_MAP)]
  }).then(html => {
    // console.log('INCOMING HTML: ', html);

    var updatedHtml = ejs.render(HTMLDecoderEncoder.decode(html), options);

    // console.log('UPDATED HTML: ', updatedHtml);

    // screenshot.fromHTML(updatedHtml, 'test.png', function() {
    //   console.log('Screenshot saved!!');
    // });
    callback(null, updatedHtml);
  });
});

// app.set('view engine', 'html');
// app.set('views', join(DIST_FOLDER, 'browser'));
app.set("view engine", "html");
app.set("views", join(DIST_FOLDER, "browser"));

app.get("/api/*", (req, res) => {
  res.status(404).send("data requests are not supported");
});

// Server static files from /browser
app.get("*.*", express.static(join(DIST_FOLDER, "browser")));

app.get("/profile", async (req, res) => {
  var uid = req.query.uid;
  if (!uid) {
    throw "Bad user id";
  }

  var response = await request(
    "POST",
    config.socketUrl + "/api/TTUsers/getPublicProfileDetail",
    {
      headers: {
        "Content-Type": "application/json"
      },
      json: {
        userId: parseInt(uid)
      }
    }
  );
  var body = await response.getBody("utf8");
  var result = JSON.parse(body);

  // console.log('Result: ', result, result.result);
  var u = result.result;
  console.log("userdata:", u);
  res.render("index", {
    title: "MaaS - " + u.firstName + " " + u.lastName,
    text: "Hi There!!",
    ogurl: config.externalUrl + "?uid=" + u.id,
    ogtitle:
      "MaaS - " + u.role.description + " - " + u.firstName + " " + u.lastName,
    ogdescription: u.userDetail.about,
    ogimg: config.externalUrl + filePath,
    req
  });
  console.log("config", config.externalUrl)
  console.log("config1", config.socketUrl)
  console.log("path1:", join(process.cwd(), "/src/views/social-sharing.ejs"));
  console.log("role name:", u.company.name);

  try {
    var html = await ejs.renderFile(
      path.resolve(join(process.cwd(), "./src/views/social-sharing.ejs")),
      {
        userImg: u.userDetail.photoUrl,
        userrating: u.userDetail.avgRating,
        externalUrl: config.externalUrl,
        userName: u.firstName + " " + u.lastName,
        userRole: u.role.description,
        companyName: "Sponsored By: " + u.company.name || "",
        userMentored: u.peopleMentored || 0,
        userSkills: u.skillsList.length,
        userRated: u.userDetail.totalVotes,
        userTokens: u.userDetail.tokenBalance || 0,
        userAbout: u.userDetail.about
      },
      {
        async: true
      }
    );
    var pdfConfig = {
      height: "6.56in",
      width: "12.5in",
      border: "0",
      type: "png"
    };
    console.log("html result :", html);
    var uuid = uuidv4();
    console.log("uuid :", uuid);

    var filePath = "/downloads/" + uuid + ".png";
    console.log("filepath :", filePath);

    var res = await pdf.createAsync(html, {
      format: "A4",
      filename: path.resolve(join(process.cwd(), "./src/assets" + filePath))
    });
    console.log("fileresult :", res);
    return filePath;
  } catch (error) {
    console.error("User Message", error);
  }
});

// program
app.get("/program", async (req, res) => {
  var pid = req.query.pid;
  if (!pid) {
    throw "Bad program id";
  }

  var response = await request(
    "POST",
    config.socketUrl + "/api/Programs/getPublicProgramDetail",
    {
      headers: {
        "Content-Type": "application/json"
      },
      json: {
        programId: parseInt(pid)
      }
    }
  );
  var body = await response.getBody("utf8");
  var result = JSON.parse(body);

  // console.log('Result: ', result, result.result);
  var p = result.result;

  res.render("index", {
    title: "MaaS - " + p.name,
    text: "Hi There!!",
    ogurl: p.publicUrl,
    ogtitle: "MaaS - " + p.name,
    ogdescription: p.description,
    ogimg: config.externalUrl + p.imgPath,
    req
  });
});

// All regular routes use the Universal engine
app.get("*", (req, res) => {
  res.render("index", { req });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});

// epipe write error message 
// ws.broadcast = (data) => {
//   ws.clients.forEach((client) => {
//     if(client && client.readyState === WebSocket.OPEN) 
//       client.send(data);
//   });
// };

process.stdout.on('error', function (err) {
  if (err.code == "EPIPE") {
    process.exit(0);
  }
});
