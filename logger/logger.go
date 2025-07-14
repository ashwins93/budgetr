package logger

import (
	"log/slog"
	"os"
)

func New() *slog.Logger {
	file, err := os.OpenFile("logs.txt", os.O_APPEND, os.ModeAppend)
	if err != nil {
		panic(err)
	}
	logger := slog.New(slog.NewTextHandler(file, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))

	return logger
}
