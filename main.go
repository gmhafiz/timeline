package main

import (
	"log"
	"net/http"
	"fmt"

	"github.com/ant0ine/go-json-rest/rest"
	"github.com/jinzhu/gorm"
	_ "github.com/mattn/go-sqlite3"
)

type (
	Event struct {
		Id		int64		`json:"id"`
		Content		string		`sql:"size:1024" json:"content"`
		Start		string		`json:"start"` // todo: change to time.Time. later can query who's working on the day
		End		string		`json:"end"`
		Type		string		`json:"type"`
		ClassName	string		`json:"className"`
		//Title		string		`json:"title"`
		Group		string		`json:"group"`
		Subgroup	string		`json:"subgroup"`
		//Style		string		`json:"style"`
		//CreatedAt	time.Time	`json:"createdAt"`
		//UpdatedAt	time.Time	`json:"updatedAt"`
		//DeletedAt	time.Time	`json:"deletedAt"` // fixme: by default, this column is not null (there's some value). Problem with sql query because it asks for: SELECT * FROM "events"  WHERE "events"."deleted_at" IS NULL AND (("events"."id" = '4')) ORDER BY "events"."id" ASC LIMIT 1

	}

	Impl struct {
		DB *gorm.DB
	}
)

func (i *Impl) InitDB() {
	var err error
	i.DB, err = gorm.Open("sqlite3", "db/events.db") // fixme: systemd cannot open this database
	if err != nil {
		log.Fatalln("Error connecting database: ", err)
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

func (i *Impl) DeleteEvent(w rest.ResponseWriter, r *rest.Request) {
	id := r.PathParam("id")
	event := Event{}
	if i.DB.First(&event, id).Error != nil {
		rest.NotFound(w, r)
		return
	}
	if err := i.DB.Delete(&event).Error; err != nil {
		rest.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func main() {
	i := Impl{}
	i.InitDB()
	i.InitSchema()

	api := rest.NewApi()
	api.Use(rest.DefaultDevStack...)
	api.Use(&rest.CorsMiddleware{
		RejectNonCorsRequests: false,
		OriginValidator: func(origin string,  request *rest.Request) bool {
			//return origin == "https://www.gmhafiz.com"
			return true
		},
		AllowedMethods: []string{"GET", "POST", "DELETE", "UPDATE", "OPTIONS"},
		AllowedHeaders: []string {
			"Accept", "Content-Type", "Origin"},
		AccessControlAllowCredentials: true,
		AccessControlMaxAge: 3600,
	})

	router, err := rest.MakeRouter(
		rest.Post("/event", i.PostEvent),
		rest.Get("/event/:id", i.GetEvent),
		rest.Get("/events", i.GetAllEvents),
		rest.Delete("/event/:id", i.DeleteEvent),
	)
	if err != nil {
		log.Fatalln(err)
	}
	api.SetApp(router)
	http.Handle("/api/", http.StripPrefix("/api", api.MakeHandler()))
	http.Handle("/public/", http.StripPrefix("/public", http.FileServer(http.Dir("./public"))))
	fmt.Println("Serving at :8080")
	log.Fatalln(http.ListenAndServe(":8080", nil))

}