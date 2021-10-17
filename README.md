[![npm version](https://badge.fury.io/js/spark-db.svg)](https://badge.fury.io/js/spark-db)
![npm bundle size](https://img.shields.io/bundlephobia/min/spark-db)

# SparkDB

> SparkDB is a server-based database framework for those who like to work with JSON and Firebase-like methods.

## Prerequisites

This project requires NodeJS (version 8 or later) and NPM.
[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.
To make sure you have them available on your machine,
try running the following command.

```sh
$ npm -v && node -v
6.4.1
v8.16.0
```

## Table of contents

- [Project Name](#project-name)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Serving the app](#serving-the-app)
    - [Running the tests](#running-the-tests)
    - [Building a distribution version](#building-a-distribution-version)
    - [Serving the distribution version](#serving-the-distribution-version)
  - [API](#api)
    - [useBasicFetch](#usebasicfetch)
      - [Options](#options)
    - [fetchData](#fetchdata)
  - [Contributing](#contributing)
  - [Credits](#credits)
  - [Built With](#built-with)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

To install and set up the library, run:

```sh
$ npm install spark-db
```

Or if you prefer using Yarn:

```sh
$ yarn add --dev spark-db
```

## Usage

### Starting SparkDB

```sh
$ node spark-db start
```

### Creating a new database

```sh
$ node spark-db create db
```

or 

```sh
$ node spark-db create db myDB
```

### Delete all your DBs and reset SparkDB

```sh
$ node spark-db finish confirm true
```

### Other commands

There are other important commands that can make your DB even better, here are some examples:
```sh
$ node spark-db restart db myDB
$ node spark-db create doc myDoc
$ node spark-db create log TYP Type "My log message"
$ node spark-db logs
$ node spark-db config
$ node spark-db config raw true
$ node spark-db config raw false
```

### About SPARK file

You may be wondering what is this 'db.spark' file. Well, it's the file you are going to use to change SparkDB's default configs, such as default DB folder. When you type ```node spark-db config raw [bool]``` on your temrminal, you are accessing this file, if raw true, it will show the SPARK file without converting it to an object, if raw false, it converts the SPARK file to a javascript object, that can be converted to a JSON file later, if you want.

## Library

### Setup

To work with SparkDB's library, you will need to do a quick setup on your workspace.

```js
const db = require('spark-db')();
```

After that, you are free to use SparkDB's methods.

### Some methods

#### readData

SparkDB works with an asynchronous method system, so will need to wait until the promise is fullfiled before going on with your code. Here is an example:

```js
const defaultFolder = 'db/'

db.readData(defaultFolder+'myDB.json')
  then((data) => {
    console.log(data)
  })
```

or

```js
var data = await db.readData(defaultFolder+'myDB.json')
console.log(data)
```

There are other methods on SparkDB's library, they are listed on the documentation, which is under development yet, wait for updates! :)

## Credits

It's just me, so... yeah.

## Built With

* NodeJS
* Love :)

## Authors

* **matjs** - [JohnDoe](https://github.com/JohnDoe)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Andrea SonnY
