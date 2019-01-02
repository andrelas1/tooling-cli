// Node JS
const {
  exec,
  spawn,
  spawnSync,
  execSync
} = require('child_process');

const {
  createInterface
} = require('readline')

const fs = require('fs');

const EventEmitter = require('events');

class CustomEmitter extends EventEmitter {}

const emitter = new CustomEmitter();

// Create project directory 
function createDir(directory) {
  execSync(`mkdir -p ${directory}/src`);
}


// Create package.json with user input
function genPackageJson(q, opt) {
  const answers = [];
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Ask questions
  function ask(qst) {
    rl.question(qst[0], (answer) => {
      answers.push(answer);
      if (qst.length !== 1) {
        ask(qst.slice(1));
      } else {
        console.log('ANSWERS', answers);
        rl.close();
        genJson('./templates/package.json', `./${dir}/package.json`);
      }
    });
  }


  // Write to package.json file
  function genJson(src, dest) {
    fs.copyFile(src, dest, cb => {
      console.log('FS COPY FILE', cb);
      fs.readFile(dest, 'utf8', (err, data) => {
        const result = data
          .replace(/(?<=\"name\":\s)\"\"/, `"${answers[0] || 'app'}"`)
          .replace(/(?<=\"description\":\s)\"\"/, `"${answers[1]}"`)
          .replace(/(?<=\"repository\":\s)\"\"/, `"${answers[2] || 'index.js' }"`)

        fs.writeFile(dest, result, cb => {
          console.log('FS WRITE FILE', cb);
          emitter.emit('webpack');
        });
      })
    });
  }
  ask(q);
}

function webpackSetup(opt, pkg) {
  emitter.on('webpack', () => {
    // Install webpack, loaders and plugins
    console.log('INSTALLING WEBPACK AND ITS DEPENDENCIES');
    const execString = 'npm install --save-dev ' + pkg.reduce((acc, val) => acc + ' ' + val);
    console.log('EXEC STRING', execString)
    exec(execString,
      opt,
      (err, stdout, stderr) => {
        console.log('OUT', stdout);
        // Gen webpack config file
      });
  });
}

const dir = process.argv[2];
const options = {
  cwd: `./${dir}`
}

function copyFiles() {
  // webpack config
  fs.copyFileSync(`./templates/webpack.config.js`, `./${dir}/webpack.config.js`);

  // default html
  fs.copyFileSync(`./templates/index.html`, `./${dir}/index.html`);

  //default js
  fs.copyFileSync(`./templates/index.js`, `./${dir}/src/index.js`);
}

async function init() {
  createDir(dir)
  copyFiles();

  const questions = [
    'app name?',
    'description?',
    'repository url?'
  ];

  genPackageJson(questions, options)

  const packages = [
    'webpack',
    'webpack-cli',
    'html-webpack-plugin',
    'webpack-bundle-analyzer',
    'ts-loader',
    'sass-loader',
    'node-sass'
  ]

  webpackSetup(options, packages);
}

init();