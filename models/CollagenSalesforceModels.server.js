var sf = require('node-salesforce');
var register = models.Models.register;
models.Models.register = function(server) {
    if (!this.prototype.salesforce && Collagen.config.salesforce) {
        // Try to reuse Salesforce connection
        if (this.prototype.model && this.prototype.model.prototype.salesforce) {
            this.prototype.salesforce = this.prototype.model.prototype.salesforce;
        } else {
            // Connect to configured Salesforce instance
            var config = Collagen.config.salesforce || {};
            var salesforce = new sf.Connection(config);

            // Wrap query to get a new login when necessary
            var query = salesforce.query;
            salesforce.query = function(soql, callback) {
                var records = [];
                query.call(salesforce, soql)
                .on('record', function(record, index, query) {
                    records.push(record);
                })
                .on('end', function(query) {
                    callback.call(salesforce, null, records)
                })
                .on('error', function(err) {
                    if (err && err.errorCode === 'INVALID_SESSION_ID') {
                        salesforce.emit('login', soql, callback);
                    } else callback.call(salesforce, err, records);
                })
                .run({autoFetch: true});
            }

            // Refresh access token
            salesforce.on('login', function(soql, callback) {
                salesforce.login(config.username, config.password + config.security_token, function(err, userInfo) {
                    if (err) console.error(err);
                    else salesforce.emit('retry', soql, callback);
                });
            });

            // Retry query
            salesforce.on('retry', function(soql, callback) {
                if (soql) salesforce.query.call(salesforce, soql, callback);
            });

            // Login user on first run
            salesforce.emit('login');
            this.prototype.salesforce = salesforce;
        }
    }
    return register.apply(this, arguments);
}
