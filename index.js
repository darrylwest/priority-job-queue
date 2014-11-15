
module.exports = {
    PriorityJobQueue:require('./lib/PriorityJobQueue'),
    models:{
        JobModel: require('./lib/JobModel')
    },
    events:{
        JobModelEvent: require('./lib/JobModelEvent'),
        TickEvent: require('./lib/TickEvent')
    }
};

