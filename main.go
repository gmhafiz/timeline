package main

import (
	"log"
	"net/http"
	"fmt"
	"time"

	"github.com/ant0ine/go-json-rest/rest"
	"github.com/jinzhu/gorm"
	_ "github.com/mattn/go-sqlite3"
)

type (
	Event struct {
		Id		int64		`json:"id"`
		Content		string		`sql:"size:1024" json:"content"`
		Start		string		`json:"start"`
		End		string		`json:"end"`
		Type		string		`json:"type"`
		Title		string		`json:"title"`
		Group		string		`json:"group"`
		Subgroup	string		`json:"subgroup"`
		Style		string		`json:"style"`
		CreatedAt	time.Time	`json:"createdAt"`
		UpdatedAt	time.Time	`json:"updatedAt"`
		//DeletedAt	time.Time	`json:"deletedAt"` // fixme: by default, this column is not null (there's some value). Problem with sql query because it asks for: SELECT * FROM "events"  WHERE "events"."deleted_at" IS NULL AND (("events"."id" = '4')) ORDER BY "events"."id" ASC LIMIT 1

	}

	Impl struct {
		DB *gorm.DB
	}
)

func (i *Impl) InitDB() {
	var err error
	i.DB, err = gorm.Open("sqlite3", "db/events.db")
	if err != nil {
		log.Fatalln("Error connecting database: '%v'", err)
	}
	i.DB.LogMode(true)
}

func (i *Impl) InitSchema() {
	i.DB.AutoMigrate(&Event{})
}

func (i *Impl) PostEvent(w rest.ResponseWriter, r *rest.Request) {
	event :=  Event{}
	if err := r.DecodeJsonPayload(&event); err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := i.DB.Save(&event).Error; err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.WriteJson(&event)
}

func( i* Impl) GetAllEvents(w rest.ResponseWriter, r *rest.Request) {
	events := []Event{}
	i.DB.Find(&events)
	w.WriteJson(&events)
}

func (i *Impl) GetEvent(w rest.ResponseWriter, r *rest.Request) {
	id := r.PathParam("id")
	event := Event{}
	if i.DB.First(&event, id).Error != nil {
		rest.NotFound(w, r)
		return
	}
	w.WriteJson(&event)
}

func main() {
	i := Impl{}
	i.InitDB()
	i.InitSchema()

	api := rest.NewApi()
	api.Use(rest.DefaultDevStack...)

	router, err := rest.MakeRouter(
		rest.Get("/message", func(w rest.ResponseWriter, req *rest.Request) {
			w.WriteJson(map[string]string{"Body":"Hello World!"})
		}),
		rest.Post("/event", i.PostEvent),
		rest.Get("/event/:id", i.GetEvent),
		rest.Get("/events", i.GetAllEvents),
	)
	if err != nil {
		log.Fatalln(err)
	}
	api.SetApp(router)
	http.Handle("/api/", http.StripPrefix("/api", api.MakeHandler()))
	// http GET http://127.0.0.1:8080/api/message

	http.Handle("/public/", http.StripPrefix("/public", http.FileServer(http.Dir("./public"))))
	// http GET http://127.0.0.1:8080/public/css/bootstrap.min.css
	fmt.Println("Serving at :8080")
	log.Fatalln(http.ListenAndServe(":8080", nil))

}