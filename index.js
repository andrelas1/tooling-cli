#!/usr/bin/env node

// chmod u+x index.js
// ln -s /Users/andreluisasantos/workspace/tooling/index.js andrelas1-tsp

// Node JS
const {
  exec,
  spawn,
  spawnSync,
  execSync
} = require("child_process");
const {
  createInterface
} = require("readline");
const fs = require("fs");
const EventEmitter = require("events");
const path = require('path');

class CustomEmitter extends EventEmitter {}

const emitter = new CustomEmitter();

const srcDirectory = path.join(__dirname);

// Create project directory
function createDir(directoryName) {
  if (directoryName) {
    execSync(`mkdir -p ${directoryName}/src`);
  } else {
    console.error('no directory name!!!!');
  }
}

const answers = [];

// Create package.json with user input
function genPackageJson(q, opt) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Ask questions
  function ask(qst) {
    rl.question(qst[0], answer => {
      answers.push(answer);
      if (qst.length !== 1) {
        ask(qst.slice(1));
      } else {
        console.log("ANSWERS", answers);
        rl.close();
        genJson("templates/package.json", `${dir}/package.json`);
      }
    });
  }

  // Write to package.json file
  function genJson(src, dest) {
    fs.copyFile(src, dest, cb => {
      console.log("FS COPY FILE", cb);
      fs.readFile(dest, "utf8", (err, data) => {
        const result = data
          .replace(/(?<=\"name\":\s)\"\"/, `"${answers[0] || "app"}"`)
          .replace(/(?<=\"description\":\s)\"\"/, `"${answers[1]}"`)
          .replace(
            /(?<=\"repository\":\s)\"\"/,
            `"${answers[2] || "index.js"}"`
          );

        fs.writeFile(dest, result, cb => {
          console.log("FS WRITE FILE", cb);
          emitter.emit("webpack");
        });
      });
    });
  }
  ask(q);
}

function webpackSetup(opt, pkg) {
  emitter.on("webpack", () => {
    // Install webpack, loaders and plugins
    console.log("INSTALLING WEBPACK AND ITS DEPENDENCIES");
    const execString =
      "npm install --save-dev " + pkg.reduce((acc, val) => acc + " " + val);
    console.log("EXEC STRING", execString);
    exec(execString, opt, (err, stdout, stderr) => {
      console.log("OUT", stdout);
    });
  });
}

// const regex = /^\//
const dir = process.argv[2];
const options = {
  cwd: `${dir}`
};

function copyFiles() {
  console.log("DIRECTORY = ", dir);
  console.log('srcDIRECTORy', srcDirectory);
  // webpack config
  fs.copyFileSync(`${srcDirectory}/templates/webpack.config.js`, `${dir}/webpack.config.js`);

  // default html
  fs.copyFileSync(`${srcDirectory}/templates/index.html`, `${dir}/index.html`);

  // ts files
  fs.copyFileSync(`${srcDirectory}/templates/index.ts`, `${dir}/src/index.ts`);
  fs.copyFileSync(`${srcDirectory}/templates/test-hmr.ts`, `${dir}/src/test-hmr.ts`);


  // jest config file
  fs.copyFileSync(`${srcDirectory}/templates/jest.config.js`, `${dir}/jest.config.js`);

  // default scss
  fs.copyFileSync(`${srcDirectory}/templates/index.scss`, `${dir}/src/index.scss`);

  // tsconfig
  fs.copyFileSync(`${srcDirectory}/templates/tsconfig.json`, `${dir}/tsconfig.json`);

  // tslint
  fs.copyFileSync(`${srcDirectory}/templates/tslint.json`, `${dir}/tslint.json`);

  // gitignore
  fs.copyFileSync(`${srcDirectory}/templates/.gitignore`, `${dir}/.gitignore`);

  // commitlint
  fs.copyFileSync(
    `${srcDirectory}/templates/commitlint.config.js`,
    `${dir}/commitlint.config.js`
  );
}

function initGit(opt, ans) {
  exec("git init", opt);
}

function init() {
  createDir(dir);
  copyFiles();

  const questions = ["app name?", "description?", "repository url?"];

  genPackageJson(questions, options);

  const packages = [
    "webpack",
    "prettier",
    "tslint",
    "jest",
    "ts-jest",
    "@types/jest",
    "tslint-config-prettier",
    "husky",
    "@commitlint/{config-conventional,cli}",
    "typescript",
    "webpack-cli",
    "html-webpack-plugin",
    "webpack-dev-server",
    "ts-loader",
    "mini-css-extract-plugin",
    "sass-loader",
    "node-sass",
    "style-loader",
    "css-loader"
  ];

  webpackSetup(options, packages);

  initGit(options, answers);
}

init();