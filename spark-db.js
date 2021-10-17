// MIT License

// Copyright (c) 2021 matjs

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const fs = require('fs');

// TO-DO:
// [*] Read
// [*] Write
// [*] Detect real time changes
// [*] Update
// [*] Query
// [*] CMD Commands
 
function genId(){
    a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    r = ''

    for(let i=0; i<30; i++){
        r+=a[parseInt(Math.random()*a.length)]
    }

    return r
}

async function readData(file, callback=undefined, id=undefined){
    try{
        if(id != undefined){
            var fileRaw = fs.readFileSync(file)
            var fileJson = JSON.parse(fileRaw)

            if(callback != undefined){
                callback()
            }
            return await Promise.resolve(fileJson[id])
        } else{
            var fileRaw = fs.readFileSync(file)
            var fileJson = JSON.parse(fileRaw)

            if(callback != undefined){
                callback()
            }
            return await Promise.resolve(fileJson)
        }
    } catch(e){
        throw Error(e)
    }
}

async function updateData(file, id, content, callback=undefined){
    try{
        var fileRaw = fs.readFileSync(file)
        var fileJson = JSON.parse(fileRaw)

        for(let i=0; i<Object.keys(content).length; i++){
            fileJson[id][Object.keys(content)[i]] = content[Object.keys(content)[i]]
        }
        var fileData = JSON.stringify(fileJson, null, 4)

        fs.writeFile(file, fileData, err => {})

        if(callback != undefined){
            callback()
        }
        return await Promise.resolve(fileJson[id])
    } catch(e){
        throw Error(e)
    }
}

async function addData(file, content, id=undefined, callback=undefined){
    if(id == undefined){
        id = genId()
    }
    try{
        var fileRaw = fs.readFileSync(file)
        var fileJson = JSON.parse(fileRaw)

        fileJson[id] = content
        var fileData = JSON.stringify(fileJson, null, 4)

        fs.writeFile(file, fileData, err => {})

        if(callback != undefined){
            callback()
        }
        return await Promise.resolve(fileJson[id], id)
    } catch(e){
        if(e.code == 'ENOENT'){
            var fileDataRaw = {}
            fileDataRaw[id] = content
            var fileData = JSON.stringify(fileDataRaw, null, 4)

            fs.writeFile(`db/${file}`, fileData, err => {})
        } else{
            throw Error(e)
        }
    }
}

async function deleteData(file, id, prop=undefined, callback=undefined){
    try{
        if(prop == undefined){
            var fileRaw = fs.readFileSync(file)
            var fileJson = JSON.parse(fileRaw)

            delete fileJson[id]
            var fileData = JSON.stringify(fileJson, null, 4)

            fs.writeFile(file, fileData, err => {})

            if(callback != undefined){
                callback()
            }

            return await Promise.resolve(fileJson)
        } else{
            var fileRaw = fs.readFileSync(file)
            var fileJson = JSON.parse(fileRaw)

            delete fileJson[id][prop]
            var fileData = JSON.stringify(fileJson, null, 4)

            fs.writeFile(file, fileData, err => {})

            if(callback != undefined){
                callback()
            }

            return await Promise.resolve(fileJson[id])
        }
    } catch(e){
        throw Error(e)
    }
}

async function onSnap(file, callback, id=undefined){
    try{
        if(id==undefined){
            var fileRaw = fs.readFileSync(file)
            var oldFile = JSON.parse(fileRaw)

            await setTimeout(async () => {
                fileRaw = fs.readFileSync(file)
                newFile = JSON.parse(fileRaw)

                if(JSON.stringify(oldFile) != JSON.stringify(newFile)){
                    var type = "DB:UNK"
                    if(Object.keys(oldFile).length < Object.keys(newFile).length){
                        type="DB:ADD"
                    } else if(Object.keys(oldFile).length > Object.keys(newFile).length){
                        type="DB:DEL"
                    } else if(Object.keys(oldFile).length == Object.keys(newFile).length){
                        type="DB:UPD"
                    }

                    callback(type)
                    onSnap(file, callback)
                } else{
                    onSnap(file, callback)
                }
            }, 1000)
        } else{
            var fileRaw = fs.readFileSync(file)
            var oldFile = JSON.parse(fileRaw)
            var oldId = oldFile[id]

            await setTimeout(async () => {
                var fileRaw = fs.readFileSync(file)
                var newFile = JSON.parse(fileRaw)
                var newId = newFile[id]
                if(JSON.stringify(oldId) != JSON.stringify(newId)){
                    var type=""
                    if(Object.keys(oldId).length < Object.keys(newId).length){
                        type="DB:ADD"
                    } else if(Object.keys(oldId).length > Object.keys(newId).length){
                        type="DB:DEL"
                    } else if(Object.keys(oldId).length == Object.keys(newId).length){
                        type="DB:UPD"
                    }

                    callback(type)
                    onSnap(file, callback, id)
                } else{
                    onSnap(file, callback, id)
                }
            }, 1000)
        }
    } catch(e) {
        throw Error(e)
    }
}

async function query(snap=false, file, query, el1, operator='', el2=''){
    var r = []

    if(snap == false){
        if(query == 'where'){
            await readData(file).then((object) => {
                let len = Object.keys(object).length

                for(let i=0; i<len; i++){
                    if(operator == "=="){
                        if(object[Object.keys(object)[i]][el1] == el2){
                            r.push(Object.keys(object)[i])
                        }
                    }

                    else if(operator == ">"){
                        if(object[Object.keys(object)[i]][el1] > el2){
                            r.push(Object.keys(object)[i])
                        }
                    }

                    else if(operator == "<"){
                        if(object[Object.keys(object)[i]][el1] < el2){
                            r.push(Object.keys(object)[i])
                        }
                    }

                    else if(operator == ">="){
                        if(object[Object.keys(object)[i]][el1] >= el2){
                            r.push(Object.keys(object)[i])
                        }
                    }

                    else if(operator == "<="){
                        if(object[Object.keys(object)[i]][el1] <= el2){
                            r.push(Object.keys(object)[i])
                        }
                    }

                    else if(operator == "!="){
                        if(object[Object.keys(object)[i]][el1] != el2){
                            r.push(Object.keys(object)[i])
                        }
                    }
                }
            })
        }

        else if(query == "orderBy"){
            function asc(prop) {    
                return function(a, b) {    
                    if (a[prop] > b[prop]) {    
                        return 1;    
                    } else if (a[prop] < b[prop]) {    
                        return -1;    
                    }    
                    return 0;    
                }    
            } 

            function desc(prop) {    
                return function(a, b) {    
                    if (a[prop] < b[prop]) {    
                        return 1;    
                    } else if (a[prop] > b[prop]) {    
                        return -1;    
                    }    
                    return 0;    
                }    
            } 

            var data=[]

            readData(file).then((object) => {
                let len = Object.keys(object).length

                for(let i=0; i<len; i++){
                    let obj = object[Object.keys(object)[i]]
                    obj['id'] = Object.keys(object)[i]

                    data.push(obj)
                }

                if(operator == 'asc'){
                    data.sort(asc(el1))
                } else{
                    data.sort(desc(el1))
                }
            })

            r = data
        }

        else if(query == "limit"){
            var data = []

            readData(file).then((object) => {
                let len = el1

                for(let i=0; i<len; i++){
                    let obj = object[Object.keys(object)[i]]
                    obj['id'] = Object.keys(object)[i]

                    data.push(obj)
                }
            })

            r = data
        }

        return await Promise.resolve(r)
    } else{
        var object = file

        if(query == 'where'){
            let len = Object.keys(object).length

            for(let i=0; i<len; i++){
                if(operator == "=="){
                    if(object[Object.keys(object)[i]][el1] == el2){
                        r.push(Object.keys(object)[i])
                    }
                }

                else if(operator == ">"){
                    if(object[Object.keys(object)[i]][el1] > el2){
                        r.push(Object.keys(object)[i])
                    }
                }

                else if(operator == "<"){
                    if(object[Object.keys(object)[i]][el1] < el2){
                        r.push(Object.keys(object)[i])
                    }
                }

                else if(operator == ">="){
                    if(object[Object.keys(object)[i]][el1] >= el2){
                        r.push(Object.keys(object)[i])
                    }
                }

                else if(operator == "<="){
                    if(object[Object.keys(object)[i]][el1] <= el2){
                        r.push(Object.keys(object)[i])
                    }
                }

                else if(operator == "!="){
                    if(object[Object.keys(object)[i]][el1] != el2){
                        r.push(Object.keys(object)[i])
                    }
                }
            }
        }

        else if(query == "orderBy"){
            function asc(prop) {    
                return function(a, b) {    
                    if (a[prop] > b[prop]) {    
                        return 1;    
                    } else if (a[prop] < b[prop]) {    
                        return -1;    
                    }    
                    return 0;    
                }    
            } 

            function desc(prop) {    
                return function(a, b) {    
                    if (a[prop] < b[prop]) {    
                        return 1;    
                    } else if (a[prop] > b[prop]) {    
                        return -1;    
                    }    
                    return 0;    
                }    
            } 

            var data=[]

            let len = Object.keys(object).length

            for(let i=0; i<len; i++){
                let obj = object[Object.keys(object)[i]]

                data.push(obj)
            }

            if(operator == 'asc'){
                data.sort(asc(el1))
            } else{
                data.sort(desc(el1))
            }

            r = data
        }

        else if(query == "limit"){
            var data = []

            let len = el1

            for(let i=0; i<len; i++){
                let obj = object[Object.keys(object)[i]]

                data.push(obj)
            }

            r = data
        }

        return await Promise.resolve(r)
    }
}

// readData('./spark-tokens.json', 'OvnrKd2PDz87odPyKMwf6jKlIy4hfi')
//     .then((data) => {
//         console.log(data)
//     })
//     .catch((e) => {
//         console.log(e)
//     })

// onSnap('./spark-tokens.json', () => {
//     console.log('change detected!')
// })

// addData('./spark-tokens.json', {'a': 'a'})
//     .then((file) => {
//         console.log(file)
//     })
//     .catch((e) => {
//         console.log(e)
//     })

// deleteData('./spark-tokens.json', 'eJSjVK5UN4k0ltGlcWHikRLoXWJSkr')
//     .then((file) => {
//         console.log(file)
//     })
//     .catch((e) => {
//         console.log(e)
//     })

// deleteData('./spark-tokens.json', 'NYh5HFKLQxrsckKudNomtgLaTFB9km', 'valida')
//     .then((file) => {
//         console.log(file)
//     })
//     .catch((e) => {
//         console.log(e)
//     })

// updateData('./spark-tokens.json', 'NYh5HFKLQxrsckKudNomtgLaTFB9km', 'valid', false)
//     .then((file) => {
//         console.log(file)
//     })

// query('./spark-tokens.json', 'where', 'token', '==', '7fzZqElh0S94KkpwdrxM10Nyu50SJT')
//     .then((result) => {
//         console.log(result)

//         readData('./spark-tokens.json', undefined, result[0]).then((object) => {
//             console.log(object)
//         })
//     })

// query('./spark-tokens.json', 'orderBy', 'valid', 'desc')
//     .then((result) => {
//         console.log("\nQuery do tipo 'orderBy', ordenada pelo campo 'valid' do arquivo 'spark-tokens' em ordem decrescente\n")
//         result.forEach((object) => {
//             console.log(`Token '${object.token}' de ID: ${object.id}, valid: ${object.valid}`)
//         })
//     })

// query('./spark-tokens.json', 'limit', 5)
//     .then((result) => {
//         result.forEach((object) => {
//             console.log(`Token '${object.token}' de ID: ${object.id}, valid: ${object.valid}`)
//         })
//     })

// query(false, './spark-tokens.json', 'orderBy', 'valid', 'asc')
//     .then((result) => {
//         query(true, result, 'limit', 5)
//             .then((result) => {
//                 result.forEach((object) => {
//                     console.log(object)
//                 })
//             })
//     })

// [*]
function createDB(dbName, where=data['DEFAULT']['FOLDER']){
    if(data['STATE']['STARTED'] == 'false'){
        createLog('MSG', 'Error', `SparkDB hasn't been started yet. Use 'node spark-db start' to start.`, false)
        return
    }
    try{
        if(where[where.length-1] == '/'){
            // Check if exists
            try{
                var fileRaw = fs.readFileSync(where+dbName+'.json')
                var file = JSON.parse(fileRaw)

                console.log(`[DB:MSG] Error => This database already exists. If you are trying to restart the database, try 'node spark-db restart db [db-name]'.`)
            } catch(e){
                // Create 
                fs.writeFile(`${where}${dbName}.json`, JSON.stringify({}), err => {
                    try{
                        if(err.code == 'ENOENT'){
                            console.log(`[DB:MSG] Error => The directory ${where} doesn't exist. Create it first and then run this command.`)
                            return
                        } else{}
                    }
                    catch(e){
                        createLog('MSG', 'Info', `Sucessfully created database '${dbName}' at '${where[where.length-1] == '/' ? `${where}` : `${where}/`}'.`)
                        data['STATE']['ACTIVEDBS'] = parseInt(data['STATE']['ACTIVEDBS']) + 1
                        updateSparkConfig()
                    }
                })
            }
        } else{
            // Check if exists
            try{
                var fileRaw = fs.readFileSync(where+'/'+dbName+'.json')
                var file = JSON.parse(fileRaw)

                console.log(`[DB:MSG] Error => This database already exists. If you are trying to restart the database, try 'node spark-db restart db [db-name]'.`)
            } catch(e){
                // Create
                fs.writeFile(`${where}/${dbName}.json`, JSON.stringify({}), err => {
                    try{
                        if(err.code == 'ENOENT'){
                            console.log(`[DB:MSG] Error => The directory ${where} doesn't exist. Create it first and then run this command.`)
                            return
                        } else{}
                    }
                    catch(e){
                        createLog('MSG', 'Info', `Sucessfully created database '${dbName}' at '${where[where.length-1] == '/' ? `${where}` : `${where}/`}'.`)
                        data['STATE']['ACTIVEDBS'] = parseInt(data['STATE']['ACTIVEDBS']) + 1
                        updateSparkConfig()
                    }
                })
            }
        }
    } catch(e){
        throw e
    }
}

// [*]
function restartDB(dbName, where=data['DEFAULT']['FOLDER']){
    if(data['STATE']['STARTED'] == 'false'){
        createLog('MSG', 'Error', `SparkDB hasn't been started yet. Use 'node spark-db start' to start.`, false)
        return
    }
    try{
        if(where[where.length-1] == '/'){
            // Check if exists and delete
            fs.unlink(where+dbName+'.json', err => {
                try{
                    if(err){
                        console.log(`[DB:MSG] Error => This database doesn't exist.`)
                    } else{
                        createLog('MSG', 'Info', `Database '${dbName}' succesfully restarted.`)
                    }
                } catch(e){
                    createLog('MSG', 'Info', `Database '${dbName}' succesfully restarted.`)
                }
            })

            fs.writeFile(where+dbName+'.json', JSON.stringify({}), err => {})
        } else{
            // Check if exists and delete
            fs.unlink(where+'/'+dbName+'.json', err => {
                try{
                    if(err){
                        console.log(`[DB:MSG] Error => This database doesn't exist.`)
                    } else{
                        createLog('MSG', 'Info', `Database '${dbName}' succesfully restarted.`)
                    }
                } catch(e){
                    createLog('MSG', 'Info', `Database '${dbName}' succesfully restarted.`)
                }
            })

            fs.writeFile(where+'/'+dbName+'.json', JSON.stringify({}), err => {})
        }
    } catch(e){
        throw e
    }
}

// [*]
function deleteDB(dbName, where=data['DEFAULT']['FOLDER']){
    if(data['STATE']['STARTED'] == 'false'){
        createLog('MSG', 'Error', `SparkDB hasn't been started yet. Use 'node spark-db start' to start.`, false)
        return
    }
    try{
        if(where[where.length-1] == '/'){
            // Check if exists and delete
            fs.unlink(where+dbName+'.json', err => {
                try{
                    if(err){
                        console.log(`[DB:MSG] Error => This database doesn't exist.`)
                    } else{
                        createLog('MSG', 'Info', `Database '${dbName}' succesfully deleted.`)
                        data['STATE']['ACTIVEDBS'] = parseInt(data['STATE']['ACTIVEDBS']) - 1
                        updateSparkConfig()
                    }
                } catch(e){
                    createLog('MSG', 'Info', `Database '${dbName}' succesfully deleted.`)
                    data['STATE']['ACTIVEDBS'] = parseInt(data['STATE']['ACTIVEDBS']) - 1
                    updateSparkConfig()
                }
            })
        } else{
            // Check if exists and delete
            fs.unlink(where+'/'+dbName+'.json', err => {
                try{
                    if(err){
                        console.log(`[DB:MSG] Error => This database doesn't exist.`)
                    } else{
                        createLog('MSG', 'Info', `Database '${dbName}' succesfully deleted.`)
                        data['STATE']['ACTIVEDBS'] = parseInt(data['STATE']['ACTIVEDBS']) - 1
                        updateSparkConfig()
                    }
                } catch(e){
                    createLog('MSG', 'Info', `Database '${dbName}' succesfully deleted.`)
                    data['STATE']['ACTIVEDBS'] = parseInt(data['STATE']['ACTIVEDBS']) - 1
                    updateSparkConfig()
                }
            })
        }
    } catch(e){
        throw e
    }
}

// [*]
function createDoc(dbName, content={}, docName=genId(), dbFolder=data['DEFAULT']['FOLDER']){
    if(data['STATE']['STARTED'] == 'false'){
        createLog('MSG', 'Error', `SparkDB hasn't been started yet. Use 'node spark-db start' to start.`, false)
        return
    }
    try{
        var rawDB = dbFolder[dbFolder.length-1] == '/' ? fs.readFileSync(dbFolder+dbName+'.json') : fs.readFileSync(dbFolder+'/'+dbName+'.json')
        var plainDB = JSON.parse(rawDB)

        if(plainDB[docName] != undefined){
            createLog('MSG', 'Error', `The document '${docName}' already exists. Try to update it through SparkDB methods (updateData).'`, false)
        } else{
            plainDB[docName] = content
            createLog('MSG', 'Info', `The document ${docName} was sucessfully created.`)

            fs.writeFile( dbFolder[dbFolder.length-1] == '/' ? dbFolder+dbName+'.json' : dbFolder+'/'+dbName+'.json', JSON.stringify(plainDB, null, 4), err => {})
        }
    } catch(e){
        if(e.code == 'ENOENT'){
            createLog('MSG', 'Error', `Database '${dbName}' wasn't found. Check if '${dbFolder}' really exists and try again.`, false)
        }
    }
}

// [*]
function deleteDoc(dbName, docName, dbFolder=data['DEFAULT']['FOLDER']){
    if(data['STATE']['STARTED'] == 'false'){
        createLog('MSG', 'Error', `SparkDB hasn't been started yet. Use 'node spark-db start' to start.`, false)
        return
    }
    try{    
        var rawDB = dbFolder[dbFolder.length-1] == '/' ? fs.readFileSync(dbFolder+dbName+'.json') : fs.readFileSync(dbFolder+'/'+dbName+'.json')
        var plainDB = JSON.parse(rawDB)

        if(plainDB[docName] != undefined){
            delete plainDB[docName]
            createLog('MSG', 'Info', `The document ${docName} was succesfully deleted.`)

            fs.writeFile( dbFolder[dbFolder.length-1] == '/' ? dbFolder+dbName+'.json' : dbFolder+'/'+dbName+'.json', JSON.stringify(plainDB, null, 4), err => {})
        } else{
            plainDB[docName] = content
            createLog('MSG', 'Error', `The document ${docName} doesn't exist.`, false)
        }

    } catch(e){
        if(e.code == 'ENOENT'){
            createLog('MSG', 'Error', `Document '${docName}' wasn't found. Check if the folder is right and if the database name is right.`, false)
        }
    }
}

// [*]
function createLog(dbCode, type, dbMessage, log=true){
    try{
        var logs = fs.readFileSync('db-logs.txt')

        logs += `\n[${new Date().toLocaleString()}][DB:${dbCode}] ${type} => ${dbMessage}`

        console.log(`[DB:${dbCode}] ${type} => ${dbMessage}`)

        if(log == true){
            fs.writeFile('db-logs.txt', logs, err => {})
        }
    } catch(e){
        console.log(`[DB:${dbCode}] ${type} => ${dbMessage}`)

        if(log == true){
            fs.writeFile('db-logs.txt', `[${new Date().toLocaleString()}][DB:${dbCode}] ${type} => ${dbMessage}`, err => {})
        }
    }
}

// [*]
function showLogs(){
    try{
        var logs = fs.readFileSync('db-logs.txt')
        console.log('\n'+logs+'\n')
    } catch(e){
        createLog('MSG', 'Error', 'No log file found. After this message, you will have a log file.', false)
    }
}

function OBJToSpark(data){
    var keys = Object.keys(data)
    var props = Object.values(data)
    var spark = ''

    for(let i=0; i<keys.length; i++){
        let thisStr = `${keys[i]}[`
        let propsArr = []
        for(let k=0; k<Object.keys(props[i]).length; k++){
            let dataK = {}
            dataK['key'] = Object.keys(props[i])[k]
            dataK['value'] = Object.values(props[i])[k]
            
            propsArr.push(`${dataK['key']}=${dataK['value']}`)
        }
        thisStr += `${propsArr.join(', ')}]`
        
        spark == '' ? spark += thisStr : spark += '\n'+thisStr
    }

    return spark
}

function sparkToOBJ(data){
    var keys = []
    var props = []
    var finalObj = {}

    var localKeys = data.split('[')
    var iteration = 0

    while(localKeys.length > 0){
        if(localKeys.length == 2){
            keys.push(localKeys[0].replace(/(\r\n|\n|\r)/gm, ""))
            localKeys.splice(0, 1)
            localKeys.splice(0, 1)
            iteration++
        } else{
            if(iteration == 0){ 
                keys.push(localKeys[0].replace(/(\r\n|\n|\r)/gm, ""))
                keys.push(localKeys[1].split(']')[1].replace(/(\r\n|\n|\r)/gm, ""))
            } else{
                if(iteration != localKeys.length){
                    keys.push(localKeys[0].split(']')[1].replace(/(\r\n|\n|\r)/gm, ""))
                }
            }
            localKeys.splice(0, 1)
            localKeys.splice(0, 1)
            iteration++
        }
    }

    var iterate = keys.length
    var lookingFor = 0

    while(iterate > 0){
        try{
            props.push(data.split('[')[lookingFor+1].split(']')[0].replace(/(\r\n|\n|\r)/gm, ""))
            lookingFor += 1
            iterate -= 1
        } catch(e){
            props.push(data.split('[')[lookingFor].split(']')[0].replace(/(\r\n|\n|\r)/gm, ""))
            lookingFor += 1
            iterate -= 1    
        }
    }

    for(let i=0; i<keys.length; i++){
        if(props[i].includes(',')){
            var propsArr = props[i].split(',')
            var propsObj = {}

            for(let i=0; i<propsArr.length; i++){
                propsObj[propsArr[i].split('=')[0].replace(/\s/g, '')] = propsArr[i].split('=')[1].replace(/\s/g, '')
            }

            finalObj[keys[i]] = propsObj
        } else{
            var propsObj = {}

            propsObj[props[i].split('=')[0].replace(/\s/g, '')] = props[i].split('=')[1].replace(/\s/g, '')
            finalObj[keys[i]] = propsObj
        }
    }
    
    return finalObj
}

function startSpark(){
    data['STATE']['STARTED'] = true
    updateSparkConfig()

    createLog('MSG', 'Info', `SparkDB has been started. Welcome!`)
}

function finishSpark(confirm='false'){
    if(confirm == 'true'){
        if(data['STATE']['STARTED'] == 'false'){
            createLog('MSG', 'Error', `SparkDB isn't initialized, why don't you start it? Try using 'node spark-db start' to initialize SparkDB.`)
            return
        }
        data['STATE']['STARTED'] = 'false'
        data['STATE']['ACTIVEDBS'] = 0
        data['DEFAULT']['FOLDER'] = 'db'

        try{
            var dbs = fs.readdirSync('db')

            for(let i=0; i<dbs.length; i++){
                fs.unlink('db/'+dbs[i], err => {})
            }
        } catch(e){
            createLog('MSG', 'Error', `SparkDB coudn't auto delete your databases because they aren't located at the default folder (${data['DEFAULT']['FOLDER']}). You will need to delete them manually.`)
        }

        updateSparkConfig()
        createLog('MSG', 'Goodbye', 'Your database (including all SparkDB functions) has been deactivated. Goodbye.')
    } else{
        createLog('MSG', 'Warning', `ATTENTION! This function is a fatal decision to your databases, it will remove all databases you have and will reset your entire SparkDB config. If you really wanna do that type 'node spark-db finish confirm true' to deactive SparkDB.`, false)
    }
}

function updateSparkConfig(){
    try{
        var dataFinal = OBJToSpark(data)
        fs.writeFile('db.spark', dataFinal, err => {})
    } catch(e){
        createLog('MSG', 'Fatal Error', `ATTENTION! Your config file 'db.spark' wasn't found, if you've moved it to another folder, move it back to where it was, it can break your database, causing serious problems. If you want, you can create a new spark.db and write: STATE[STARTED=false, ACTIVEDBS=0].`)
    }
}

function showSparkConfig(raw='false'){
    if(raw == 'true'){
        console.log(OBJToSpark(data))
    } else if(raw == 'false') {
        console.log(data)
    }else{
        console.log('SparkDB initlialized:', data['STATE']['STARTED'])
        console.log('Total databases:', data['STATE']['ACTIVEDBS'])
        console.log('Default database folder:', data['DEFAULT']['FOLDER'])
    }
}

console.log('\nSparkDB v1.0\n=======\n')

try{
    var data = sparkToOBJ(fs.readFileSync('db.spark').toString())
} catch(e){
    createLog('MSG', 'Fatal Error', `ATTENTION! Your config file 'db.spark' wasn't found, if you've moved it to another folder, move it back to where it was, it can break your database, causing serious problems. If you want, you can create a new spark.db and write: STATE[STARTED=false, ACTIVEDBS=0].`)
}

const cmds = {
    'start': startSpark,
    'finish': finishSpark,
    'finish confirm': finishSpark,
    'create': () => {console.log("[DB:MSG] Warning => 'create' command needs a second argument. Try 'db' or 'doc'")},
    'create db': createDB,
    'restart db': restartDB,
    'delete db': deleteDB,
    'create doc': createDoc,
    'delete doc': deleteDoc,
    'create log': createLog,
    'config': showSparkConfig,
    'config raw': showSparkConfig,
    'logs': showLogs
}

try{
    if(process.argv[3] == undefined){
        cmds[process.argv[2]]()
    } else{
        let cmd = `${process.argv[2]} ${process.argv[3]}`

        if(process.argv[4] == undefined){
            process.argv[5] == undefined ? cmds[cmd](genId()) : cmds[cmd](genId(), process.argv[5])
        } else{
            if(process.argv[6] == undefined){
                process.argv[5] == undefined ? cmds[cmd](process.argv[4]) : cmds[cmd](process.argv[4], process.argv[5])
            } else{
                if(process.argv[7] == undefined){
                    process.argv[5] == undefined ? cmds[cmd](process.argv[4]) : cmds[cmd](process.argv[4], process.argv[5], process.argv[6])
                } else{
                    process.argv[5] == undefined ? cmds[cmd](process.argv[4]) : cmds[cmd](process.argv[4], process.argv[5], process.argv[6], process.argv[7])
                }
            }
        }
    }
} catch(e){
}

exports.readData = readData
exports.onSnap = onSnap
exports.addData = addData
exports.deleteData = deleteData
exports.updateData = updateData
exports.query = query
exports.createLog = createLog