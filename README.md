# Ghost Pavilion API
https://fierce-hollows-84409.herokuapp.com/

The api for the Ghost Pavilion app was created with Node JS. It uses a database with tables for the shows and the subscribers. The api uses Express, Morgan, CORS and Knex. For testing I used supertest and mocha.

There is currently no authentication.

## API Documentation
The Ghost Pavilion API is organized around REST. It accepts standard GET, POST, and DELETE requests for shows and subscribers. The API returns JSON encoded responses.

All API calls begin with: https://fierce-hollows-84409.herokuapp.com/api/

###Shows
GET /shows GET /shows/:show_id POST /shows DELETE /shows/:show_id

###Subscribers
GET /emails GET /emails/email_id POST /emails DELETE /emails/:email_id