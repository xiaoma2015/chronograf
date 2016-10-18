package operations

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"fmt"
	"net/http"

	"github.com/go-openapi/runtime"

	"github.com/influxdata/mrfusion/models"
)

/*PostLayoutsCreated Successfully created new layout

swagger:response postLayoutsCreated
*/
type PostLayoutsCreated struct {
	/*Location of the newly created layout
	  Required: true
	*/
	Location string `json:"Location"`

	// In: body
	Payload *models.Layout `json:"body,omitempty"`
}

// NewPostLayoutsCreated creates PostLayoutsCreated with default headers values
func NewPostLayoutsCreated() *PostLayoutsCreated {
	return &PostLayoutsCreated{}
}

// WithLocation adds the location to the post layouts created response
func (o *PostLayoutsCreated) WithLocation(location string) *PostLayoutsCreated {
	o.Location = location
	return o
}

// SetLocation sets the location to the post layouts created response
func (o *PostLayoutsCreated) SetLocation(location string) {
	o.Location = location
}

// WithPayload adds the payload to the post layouts created response
func (o *PostLayoutsCreated) WithPayload(payload *models.Layout) *PostLayoutsCreated {
	o.Payload = payload
	return o
}

// SetPayload sets the payload to the post layouts created response
func (o *PostLayoutsCreated) SetPayload(payload *models.Layout) {
	o.Payload = payload
}

// WriteResponse to the client
func (o *PostLayoutsCreated) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	// response header Location
	rw.Header().Add("Location", fmt.Sprintf("%v", o.Location))

	rw.WriteHeader(201)
	if o.Payload != nil {
		if err := producer.Produce(rw, o.Payload); err != nil {
			panic(err) // let the recovery middleware deal with this
		}
	}
}

/*PostLayoutsDefault A processing or an unexpected error.

swagger:response postLayoutsDefault
*/
type PostLayoutsDefault struct {
	_statusCode int

	// In: body
	Payload *models.Error `json:"body,omitempty"`
}

// NewPostLayoutsDefault creates PostLayoutsDefault with default headers values
func NewPostLayoutsDefault(code int) *PostLayoutsDefault {
	if code <= 0 {
		code = 500
	}

	return &PostLayoutsDefault{
		_statusCode: code,
	}
}

// WithStatusCode adds the status to the post layouts default response
func (o *PostLayoutsDefault) WithStatusCode(code int) *PostLayoutsDefault {
	o._statusCode = code
	return o
}

// SetStatusCode sets the status to the post layouts default response
func (o *PostLayoutsDefault) SetStatusCode(code int) {
	o._statusCode = code
}

// WithPayload adds the payload to the post layouts default response
func (o *PostLayoutsDefault) WithPayload(payload *models.Error) *PostLayoutsDefault {
	o.Payload = payload
	return o
}

// SetPayload sets the payload to the post layouts default response
func (o *PostLayoutsDefault) SetPayload(payload *models.Error) {
	o.Payload = payload
}

// WriteResponse to the client
func (o *PostLayoutsDefault) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	rw.WriteHeader(o._statusCode)
	if o.Payload != nil {
		if err := producer.Produce(rw, o.Payload); err != nil {
			panic(err) // let the recovery middleware deal with this
		}
	}
}