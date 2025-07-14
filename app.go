package main

import (
	"budgeter/db"
	"budgeter/logger"
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// App struct
type App struct {
	ctx    context.Context
	models *db.Db
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	log := logger.New()
	conn, err := openDb("test.db")

	if err != nil {
		log.Error("Failed to open db", slog.String("error", err.Error()))
		os.Exit(1)
	}

	a.models = db.New(conn, log)
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) CreateTransaction(t db.Transaction) (*db.Transaction, error) {
	err := a.models.CreateTransaction(a.ctx, &t)
	if err != nil {
		return nil, err
	}

	return &t, nil
}

func (a *App) GetTransactions(date string) ([]*db.Transaction, error) {
	actualDate, err := time.Parse(time.RFC3339, date)
	if err != nil {
		return nil, err
	}

	res, err := a.models.GetTransactions(a.ctx, actualDate)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (a *App) UpdateTransaction(t db.Transaction) error {
	return a.models.UpdateTransaction(a.ctx, &t)
}

func (a *App) DeleteTransaction(id string) error {
	return a.models.DeleteTransaction(a.ctx, id)
}

func openDb(filename string) (*sql.DB, error) {
	conn, err := sql.Open("sqlite3", fmt.Sprintf("file:%s", filename))
	if err != nil {
		return nil, err
	}

	err = conn.Ping()
	if err != nil {
		return nil, err
	}

	return conn, nil
}
