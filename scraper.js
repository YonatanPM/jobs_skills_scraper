import axios from "axios";
import fs from "fs";
import { parse } from "node-html-parser";

var pageForScraping = "https://www.sqlink.com/career/web/";
var pageCounter = 2;
var positionsIdsArray = [];
var suspendFn = true;

suspendFn = firstPageScrap();

if (suspendFn === false) {
  while (pageCounter < 4) {
    nextPagesScrap(pageCounter);
    pageCounter++;
  }
}
async function getSqlinkWebPage() {
  const sqlinkHtml = await axios.get(pageForScraping);
  const sqlinkParsed = parse(sqlinkHtml.data);
  const positions = sqlinkParsed.querySelectorAll("div.article");
  positions.forEach((singlePosition) => {
    let currentId = singlePosition.getAttribute("id").slice(3, 8);
    const currentRequirements = singlePosition.querySelector(
      "section.requirements"
    );
    let currentRequirementsClean = String(currentRequirements)
      .replace(/[^0-9a-zA-Z >]/g, "")
      .replace(/strong>/g, "")
      .replace(/p>/g, "")
      .replace(/section>/g, "")
      .replace(/section classrequirements>/g, "")
      .replace(/br>/g, "")
      .split(" ")
      .filter((element) => element !== "");
    positionsIdsArray.push({ id: currentId, req: currentRequirementsClean });
  });
  return positionsIdsArray;
}
function firstPageScrap() {
  var firstPageFulfilled = Promise.resolve(getSqlinkWebPage());
  firstPageFulfilled.then((positionsIdsArray) => {
    fs.writeFile("sqlink_data1.txt", JSON.stringify(positionsIdsArray), () => {
      console.log("first page was saved");
    });
  });
  while (pageCounter < 15) {
    nextPagesScrap(pageCounter);
    pageCounter++;
  }
}

function nextPagesScrap(pageCounter) {
  pageForScraping = `https://www.sqlink.com/career/web/?page=${pageCounter}`;
  const nextPageFulfilled = Promise.resolve(getSqlinkWebPage());
  console.log("promise fulfilled");
  nextPageFulfilled.then((positionsIdsArray) => {
    fs.writeFile(
      `sqlink_data${pageCounter}.txt`,
      JSON.stringify(positionsIdsArray),
      () => {
        console.log(`page no ${pageCounter} was saved`);
      }
    );
  });
}
