## Description

API from Arzion test

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start
```

## Database connection

```bash
Set mysql database settings in ormconfig.json

{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "APIUser",
  "password": "APIPass123",
  "database": "ARZTEST_DB",
  "entities": ["src/**/**.entity{.ts,.js}"],
  "synchronize": true
}
```

## Example database

Inside folder "database" on project root folder, there is a dump of an example database. To test fullish date, test to save a package for a 2019-02-20

# Authentication

This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme.

```bash
Authorization: Token jwt.token.here
```

To login in API, check endpoint /api/login below

## API Specification - Most important endpoints

Use `Content-type` header to request:
```bash
Content-type: application/json
```

### Users

Registration:

POST /api/users

```bash
Example request body:

{
  "user":{
    "username": "unjuanca",
    "password": "unjuanca123"
  }
}
```

Login:

POST /api/users/login

```bash
Example request body:

{
  "user":{
    "username": "unjuanca",
    "password": "unjuanca123"
  }
}
```

### Package

Add a package:

POST /api/packages

```bash
Example request body:

{
  "package": {
  "address": "-35.164409, -57.871817",
  "description": "Este es un recontra paquete322",
  "deliver_date": "2019-02-18"
  }
}
```

```bash
Address may can be a city:

{
  "package": {
  "address": "Ranchos, Argentina",
  "description": "Este es un paquete de contenido frágil",
  "deliver_date": "2019-02-18"
  }
}
```

Get all packages:

GET /api/packages

Get package by id:

GET /api/packages/:packageId
