// dpw@alameda.local
// 2014.11.08
'use strict';

var PriorityJobQueue = require('../lib/PriorityJobQueue'),
    JobModel = require('../lib/JobModel');

if (window) {
    window.bootstrapApplication = function() {
        var queue = PriorityJobQueue.createInstance();

        window.queue = queue;
    };
}

