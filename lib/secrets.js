const AWS = require('aws-sdk');

module.exports = class Secrets {
    constructor (param) {
        if (typeof param === 'undefined') {
            throw new Error('Cannot be called directly');
        }
    }

    static async get (name) {
        let self = this;
        return new Promise(async function(resolve, reject) {
            await self.init();
            resolve(global._secrets[name]);
        });
    }

    static async init () {
        let self = this;
        return new Promise(async function(resolve, reject) {
            if (!global._secrets){
                global._ssm = new AWS.SSM();
                try {
                    let resp = await global._ssm.getParameter({
                        Name: `/mother/secure/${process.env.NODE_ENV}/secrets`,
                        WithDecryption: true,
                    }).promise();

                    global._secrets = JSON.parse(resp.Parameter.Value);
                } catch (e){
                    console.log(`error retrieving secrets for the ${process.env.NODE_ENV} environment. error was: ${e}`);
                }
            }    
            resolve(global._secrets);
        });
    }
}