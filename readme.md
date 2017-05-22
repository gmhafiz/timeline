# timeline vis.js

## Introduction
Display your own timeline history using [vis.js](http://visjs.org). 

Features:
 - Backend is powered with golang with RESTful api [https://github.com/ant0ine/go-json-rest](https://github.com/ant0ine/go-json-rest)
 - CRUD: Data persistence with sqlite using [gorm](https://github.com/jinzhu/gorm)
 - CORS: Access-Control-Allow-Origin
 - each changes reflects on frontend and database backend
 - Simple frontend with bootstrap and ajax for form data binding
 - ability to serve frontend static HTML + CSS + JS
 - Javascript checking if the event type is a range or type based on checkbox and if end date is entered or not
 

## Motivation
It is about time that I learn about standards like RESTful api and data persistence with CRUD. This pet project exposes me with many useful web standards and technologies for my future endeavor as a network programmer and web developer.  

## Download
There are two ways of obtaining the code.

1. with `go get`

    go get github.com/gmhafiz/timeline

2. with `git clone`

    git clone git@github.com:gmhafiz/timeline.git

## Usage

1. Obtain the code
2. run `go run main.go`
3. go to `http://localhost:8080/public` to access frontend
4. (Optional) install httpie `sudo apt install httpie` for http queries
5. Follow examples below


## API

### Model

- Not all visjs api are implemented yet. 
- `content` and `start` are required fields. 
- All changes to the database are reflected to `db/events.db`


```
Event struct {
    Id      int64   `json:"id"`
    Content string  `sql:"size:1024" json:"content"`
    Start   string  `json:"start"`
    End     string  `json:"end"`
    Type    string  `json:"type"`
}
```

### POST

    /api/event/
    
Example:

```bash
http POST http://localhost:8080/api/event content="event 1" start=2016-12-11 end=2016-12-12 type=range
```
    
   
Returns

```
HTTP/1.1 200 OK
Content-Length: 86
Content-Type: application/json; charset=utf-8
Date: Mon, 17 Apr 2017 04:23:39 GMT
X-Powered-By: go-json-rest

{
    "content": "event 1", 
    "start": "2016-12-11", 
    "end": "2016-12-12", 
    "id": 1, 
    "type": "range"
}

```

### GET

1. Get a specific event by id

    /api/event/:id
    
    
Example

```bash
http GET http://localhost:8080/api/event/1
```
    
    
Returns

```
HTTP/1.1 200 OK
Content-Length: 103
Content-Type: application/json; charset=utf-8
Date: Mon, 17 Apr 2017 04:25:33 GMT
X-Powered-By: go-json-rest

{
    "content": "event 1", 
    "start": "2016-12-11", 
    "end": "2016-12-12", 
    "id": 1, 
    "type": "range"
}



```
    
2. Get all events

    /api/events
    
    
Example:
    
```bash
http GET http://localhost:8080/api/events
```


Returns

```
HTTP/1.1 200 OK
Content-Length: 1402
Content-Type: application/json; charset=utf-8
Date: Mon, 17 Apr 2017 04:26:55 GMT
X-Powered-By: go-json-rest

[
    {
        "content": "event 1", 
        "start": "2016-12-11", 
        "end": "2016-12-12", 
        "id": 1, 
        "type": "range"
    }, 
    {
        "content": "e4", 
        "end": "2017-04-15", 
        "id": 2, 
        "start": "2017-04-14", 
        "type": "point"
    }, 
    {
        "content": "e6", 
        "end": "", 
        "id": 3, 
        "start": "2017-04-16", 
        "type": "point"
    }
]

```
    
    
    
### DELETE

    /api/event/:id
    
Example

```bash
http DELETE http://localhost:8080/api/event/3
```


Returns

```
HTTP/1.1 200 OK
Content-Length: 0
Content-Type: application/json; charset=utf-8
Date: Mon, 17 Apr 2017 04:29:04 GMT
X-Powered-By: go-json-rest

```

### UPDATE

todo

### TODO

- [x] RESTful API
- [x] CRUD data persistence with sqlite using gorm
- [x] One way data binding from frontend to backend
- [x] Two way data binding
- [x] CORS Support
- [ ] Allow user registration with oauth
- [ ] Allow only logged in user to modify data
- [ ] Limit JSON acceptance size
- [x] Make frontend load `public/events.json` automatically
- [x] Update timeline frontend automatically after submitting new event
- [x] Viz timeline is populated from database immediately on page load
- [ ] Do UPDATE http request
- [ ] moving or resizing event(s) updates the database

### Credits || References

- [vis.js/docs/timeline](http://visjs.org).
- [https://github.com/ant0ine/go-json-rest](https://github.com/ant0ine/go-json-rest) json REST library
- [golang docs](https://golang.org/doc/)
-  [sqlite3 driver](github.com/mattn/go-sqlite3)
- [gorm orm](https://github.com/jinzhu/gorm)
- [bootstrap](https://getbootstrap.com)
- [sweetalert](http://t4t5.github.io/sweetalert)
- https://stackoverflow.com/questions/24770403/go-write-struct-to-json-file-using-struct-fields-not-json-keys
- https://stackoverflow.com/questions/9688660/send-json-from-html-form-with-nodejs-backend
- https://github.com/gin-gonic/gin/issues/75
- https://medium.com/@etiennerouzeaud/how-to-create-a-basic-restful-api-in-go-c8e032ba3181#.a9e3jjgwl
- http://phalt.co/a-simple-api-in-go/
- https://httpie.org/ -  CLI, cURL-like tool for humans
- http://thenewstack.io/make-a-restful-json-api-go/
- https://stevenwhite.com/building-a-rest-service-with-golang-2/