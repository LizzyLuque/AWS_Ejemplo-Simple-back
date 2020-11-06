//Para esta función se utizo la platilla de ejemplo proporcionada por AWS, la cual es la siguiente:

const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();


/**
 * Provide an event that contains the following keys:
 *
 *   - operation: one of the operations in the switch statement below
 *   - tableName: required for operations that interact with DynamoDB
 *   - payload: a parameter to pass to the operation being performed
 */
exports.handler = async (event) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    const operation = event.operation;
    const payload = event.payload;

    if (event.tableName) {
        payload.TableName = event.tableName;
    }

    switch (operation) {
        case 'create':
            return await dynamo.put(payload).promise();
        case 'read':
            return await dynamo.get(payload).promise();
        case 'update':
            return await dynamo.update(payload).promise();
        case 'delete':
            return await dynamo.delete(payload).promise();
        case 'list':
            return await dynamo.scan(payload).promise();
        case 'echo':
            return payload;
        case 'ping':
            return 'pong';
        default:
            throw new Error(`Unrecognized operation "${operation}"`);
    }
};
