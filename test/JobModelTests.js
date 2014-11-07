/**
 * @class JobModelTests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 2:11 PM
 */
var should = require('chai').should(),
    dash = require('lodash' ),
    JobModel = require('../lib/JobModel' ),
    Dataset = require('./fixtures/JobQueueDataset');

describe('JobModel', function() {
    'use strict';

    var dataset = new Dataset();

    describe('#instance', function() {
        var job = new JobModel(),
            methods = [
                'getPriority',
                'setPriority',
                'getStatus',
                'setStatus',
                'run',
                // inherited
                'addListener',
                'emit',
                'listeners',
                'on',
                'once',
                'removeAllListeners',
                'removeListener',
                'setMaxListeners'
            ];

        it('should create an instance of JobModel', function() {
            should.exist( job );
            job.should.be.instanceof( JobModel );

            should.exist( job.id );
            should.exist( job.dateCreated );

            job.getPriority().should.equal( JobModel.NORMAL_PRIORITY );
            job.getStatus().should.equal( JobModel.NEW_STATUS );
        });

        it('should have all known methods by size and type', function() {
            dash.methods( job ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                job[ method ].should.be.a( 'function' );
            });
        });

        it('should create a new job model with parameters', function() {
            var job,
                params = {
                    description:'my test job',
                    fn: function(args) { console.log( args );},
                    args:[ 1, 'b', 3 ],
                    callback: function(err, res) { },
                    priority: JobModel.HIGH_PRIORITY
                };

            job = new JobModel( params );

            should.exist( job );
            should.exist( job.id );
            should.exist( job.dateCreated );

            job.getStatus().should.equal( JobModel.NEW_STATUS );

            job.description.should.equal( params.description );
            job.fn.should.equal( params.fn );
            job.args.should.equal( params.args );
            job.callback.should.equal( params.callback );
            job.getPriority().should.equal( params.priority );
        });
    });

    describe('setStatus', function() {
        it('should change status and fire an event on change', function(done) {
            var job = new JobModel();

            job.on( JobModel.STATUS_CHANGE_EVENT, function(value) {
                value.should.equal( JobModel.RUNNING );
                job.getStatus().should.equal( JobModel.RUNNING );

                done();
            });

            job.setStatus( JobModel.RUNNING );
        });

        it('should ignore attempts to set to existing status', function() {
            var job = new JobModel({ status:JobModel.COMPLETE });

            job.on( JobModel.STATUS_CHANGE_EVENT, function() {
                throw new Error('should not fire an event');
            });

            job.getStatus().should.equal( JobModel.COMPLETE );

            job.setStatus( JobModel.COMPLETE );
        });
    });

    describe('setPriority', function() {
        it('should change priority and fire an event on change', function(done) {
            var job = new JobModel();

            job.on( JobModel.PRIORITY_CHANGE_EVENT, function(value) {
                value.should.equal( JobModel.HIGH_PRIORITY );
                job.getPriority().should.equal( JobModel.HIGH_PRIORITY );

                done();
            });

            job.setPriority( JobModel.HIGH_PRIORITY );
        });

        it('should ignore attempts to set to existing priority', function() {
            var job = new JobModel({ priority:JobModel.LOW_PRIORITY });

            job.on( JobModel.PRIORITY_CHANGE_EVENT, function() {
                throw new Error('should not fire an event');
            });

            job.getPriority().should.equal( JobModel.LOW_PRIORITY );

            job.setPriority( JobModel.LOW_PRIORITY );
        });
    });
});