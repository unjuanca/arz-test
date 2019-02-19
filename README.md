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

## Database

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

## API Specification - Most important endpoints

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
  "address": "Ranchos, Argentina",
  "description": "Este es un recontra paquete322",
  "deliver_date": "2019-02-18"
  }
}
```

Get all packages:

GET /api/packages

```bash
{
  "package": {
  "address": "Ranchos, Argentina",
  "description": "Este es un recontra paquete322",
  "deliver_date": "2019-02-18"
  }
}
```

Get package by id:

GET /api/packages/:packageId
