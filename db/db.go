package db

import (
	"database/sql"
	"log/slog"
)

type Db struct {
	db  *sql.DB
	log *slog.Logger
}

func New(conn *sql.DB, log *slog.Logger) *Db {
	return &Db{
		db:  conn,
		log: log,
	}
}
