const sheetId               = '1Lo8wa8zJ0Qpv31CoouV3_w3qLnlkuFK7MxgYqHvBf9U';
const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT }               = require('google-auth-library');
const secrets               = require('../lib/secrets');

exports.get = async function(req, res) {
    let clientEmail = await secrets.get("client_email");
    let privateKey = await secrets.get("private_key");
    const serviceAccountAuth = new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

    const doc = new GoogleSpreadsheet(
        sheetId,
        serviceAccountAuth
    );

    try {
        var JSONrows = [];

        await doc.loadInfo(); // Loads document properties and worksheets
        const sheet = doc.sheetsByIndex[0]; // Access the first sheet
        let rows = await sheet.getRows();
        let headerProps = rows[0]._worksheet._headerValues;

        for (var i = 0; i < rows.length; i++) {
            let JSONrow = {}
            for (var p = 0; p < headerProps.length; p++) {

                JSONrow[headerProps[p]] = rows[i]._rawData[p];
            }
            JSONrows.push(JSONrow);
        }

        res.status(200).send(JSONrows);
    } catch (error) {
        console.error("Failed read data from the locations sheet:", error);
        res.status(500).send();
    }

};