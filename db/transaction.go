package db

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/google/uuid"
)

type Transaction struct {
	ID            string    `json:"id"`
	Amount        int64     `json:"amount"`
	Description   string    `json:"description"`
	EffectiveDate time.Time `json:"effectiveDate"`
	Pinned        int       `json:"pinned"`
}

func (d *Db) CreateTransaction(ctx context.Context, t *Transaction) error {
	id, err := uuid.NewRandom()
	if err != nil {
		return err
	}

	t.ID = id.String()
	query := `INSERT INTO transactions 
	(id, amount, description, effective_date, pinned) 
	VALUES (?, ?, ?, ?, ?)`
	d.log.Debug("executing query", slog.String("query", query))

	res, err := d.db.ExecContext(ctx, query, t.ID, t.Amount, t.Description, t.EffectiveDate.Unix(), t.Pinned)
	if err != nil {
		d.log.Error("error executing query", slog.String("error", err.Error()))
		return err
	}
	rows, _ := res.RowsAffected()

	d.log.Debug("query success", slog.Int64("rows_affected", rows))

	return nil
}

func (d *Db) GetTransactions(ctx context.Context, date time.Time) ([]*Transaction, error) {

	start := time.Date(date.UTC().Year(), date.UTC().Month(), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0)

	query := `SELECT id, amount, description, effective_date,
		pinned FROM transactions
		WHERE (effective_date >= ? AND effective_date < ?) OR (pinned = 1)`

	var transactions []*Transaction

	d.log.Debug("executing query", slog.String("query", query))
	rows, err := d.db.QueryContext(ctx, query, start.Unix(), end.Unix())
	if err != nil {
		d.log.Error("failed to fetch", slog.String("error", err.Error()))
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var t Transaction
		var effectiveDate int64

		err := rows.Scan(&t.ID, &t.Amount, &t.Description, &effectiveDate, &t.Pinned)
		if err != nil {
			d.log.Error("error while scanning", slog.String("error", err.Error()))
			return nil, err
		}

		t.EffectiveDate = time.Unix(effectiveDate, 0)

		transactions = append(transactions, &t)
	}

	return transactions, nil
}

func (d *Db) UpdateTransaction(ctx context.Context, t *Transaction) error {
	query := `UPDATE transactions
	SET amount = ?, description = ?, effective_date = ?, pinned = ?
	WHERE id = ?`

	d.log.Debug("executing query", slog.String("query", query))
	res, err := d.db.ExecContext(ctx,
		query, t.Amount, t.Description, t.EffectiveDate.Unix(), t.Pinned, t.ID)

	if err != nil {
		d.log.Error("error executing query", slog.String("error", err.Error()))
		return err
	}

	if rows, err := res.RowsAffected(); err != nil || rows != 1 {
		return errors.New("error updating transaction")
	}

	return nil
}

func (d *Db) DeleteTransaction(ctx context.Context, id string) error {
	query := `DELETE FROM transactions WHERE id = ?`

	d.log.Debug("executing query", slog.String("query", query))
	_, err := d.db.ExecContext(ctx, query, id)
	if err != nil {
		d.log.Error("error executing query", slog.String("error", err.Error()))
		return err
	}

	return nil
}
