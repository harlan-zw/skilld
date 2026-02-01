'use strict';

var spawn = require('child_process').spawn,
    es    = require('event-stream');

module.exports = function childrenOfPid(pid, includeRoot, callback) {
  var headers = null;

  // includeRoot is optional parameter
  if (typeof includeRoot === 'function') {
      callback = includeRoot;
      includeRoot = false;
  }

  if (typeof callback !== 'function') {
    throw new Error('childrenOfPid(pid, callback) expects callback');
  }

  if (typeof pid === 'number') {
    pid = pid.toString();
  }

  //
  // The `ps-tree` module behaves differently on *nix vs. Windows
  // by spawning different programs and parsing their output.
  //
  // Linux:
  // 1. " <defunct> " need to be striped
  // ```bash
  // $ ps -A -o comm,ppid,pid,stat
  // COMMAND          PPID   PID STAT
  // bbsd             2899 16958 Ss
  // watch <defunct>  1914 16964 Z
  // ps              20688 16965 R+
  // ```
  //
  // Win32:
  // 1. wmic PROCESS WHERE ParentProcessId=4604 GET Name,ParentProcessId,ProcessId,Status)
  // 2. The order of head columns is fixed
  // ```shell
  // > wmic PROCESS GET Name,ProcessId,ParentProcessId,Status
  // Name                          ParentProcessId  ProcessId   Status
  // System Idle Process           0                0
  // System                        0                4
  // smss.exe                      4                228
  // ```

  var processLister;
  if (process.platform === 'win32') {
    // See also: https://github.com/nodejs/node-v0.x-archive/issues/2318
    processLister = spawn('wmic.exe', ['PROCESS', 'GET', 'ProcessId,ParentProcessId,WorkingSetSize,Name']);
  } else {
    processLister = spawn('ps', ['-A', '-o', 'ppid,pid,stat,rss,comm']);
  }

  processLister.on('error', callback);

  es.connect(
    // spawn('ps', ['-A', '-o', 'ppid,pid,stat,comm']).stdout,
    processLister.stdout,
    es.split(),
    es.map(function (line, cb) { //this could parse alot of unix command output
      var columns = line.trim().split(/\s+/);
      if (!headers) {
        headers = columns;

        //
        // Rename Win32 header name, to as same as the linux, for compatible.
        //
        headers = headers.map(normalizeHeader);
        return cb();
      }

      // Convert RSS to number of bytes
      if (process.platform == 'win32') {
          columns[2] = parseInt(columns[2], 10);
      }
      else {
          columns[3] = parseInt(columns[3], 10);
          columns[3] *= 1024;
      }

      var row = {};
      // For each header
      var h = headers.slice();
      while (h.length) {
        row[h.shift()] = h.length ? columns.shift() : columns.join(' ');
      }

      // For Windows, WMIC.exe never returns any value for "Status" which used to get value corresponding to "STAT"
      // See: https://docs.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process?redirectedfrom=MSDN
      // So just set "null" for the backward compatibility.
      if (process.platform == 'win32') {
        row['STAT'] = null;
      }

      return cb(null, row);
    }),
    es.writeArray(function (err, ps) {
      var parents = {};
      var children = [];

      parents[pid] = true;

      ps.forEach(function (proc) {
        if (parents[proc.PPID]) {
          parents[proc.PID] = true;
          children.push(proc);
        } else if (includeRoot && pid === proc.PID) {
          children.push(proc);
        }
      });

      callback(null, children);
    })
  ).on('error', callback)
}

/**
 * Normalizes the given header `str` from the Windows
 * title to the *nix title.
 *
 * @param {string} str Header string to normalize
 */
function normalizeHeader(str) {
  if (process.platform !== 'win32') {
    // HOTFIX: On Mac ps gives "COMM" instead of "COMMAND"
    if (str === "COMM") return "COMMAND";
    return str;
  }

  switch (str) {
    case 'Name':
      return 'COMMAND';
    case 'ParentProcessId':
      return 'PPID';
    case 'ProcessId':
      return 'PID';
    case 'Status':
      return 'STAT';
    case 'WorkingSetSize':
      return 'RSS';
    default:
      throw new Error('Unknown process listing header: ' + str);
  }
}
