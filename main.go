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
	Events struct {
		Id		int64		`json:"id"`
		Title		string		`json:"title"`
		Content		string		`sql:"size:1024" json:"content"`
		Start		string		`json:"start"`
		End		string		`json:"end"`
		Type		string		`json:"type"`
		Group		string		`json:"group"`
		Subgroup	string		`json:"subgroup"`
		Style		string		`json:"style"`
		CreatedAt	time.Time	`json:"createdAt"`
		UpdatedAt	time.Time	`json:"updatedAt"`
		DeletedAt	time.Time	`json:"-"`
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
	i.DB.AutoMigrate(&Events{})
}

func (i *Impl) PostEvent(w rest.ResponseWriter, r *rest.Request) {
	event :=  Events{}
	if err := r.DecodeJsonPayload(&event); err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := i.DB.Save(&event).Error; err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
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