const fs = require('fs');

function getExtensionPath () {
    return __dirname + '/compiled.js';
}

let script = null;
function getInjectableScript() {
    if (script === null) {
        script = fs.readFileSync(getExtensionPath(), 'utf-8');
    }
    return script;
}

module.exports = {
    getExtensionPath,
    getInjectableScript,
}