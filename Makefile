.PHONY: help install lint format lint-backend format-backend lint-frontend format-frontend typecheck typecheck-backend launch clean

# デフォルトターゲット
help:
	@echo "Available commands:"
	@echo "  make install          - Install all dependencies (backend + frontend)"
	@echo "  make lint             - Run linters for both backend and frontend"
	@echo "  make format           - Format code for both backend and frontend"
	@echo "  make typecheck        - Run type checkers for backend"
	@echo "  make launch           - Launch both backend and frontend servers"
	@echo "  make lint-backend     - Run backend linter (ruff)"
	@echo "  make format-backend   - Format backend code (ruff)"
	@echo "  make typecheck-backend - Run backend type checker (mypy)"
	@echo "  make lint-frontend    - Run frontend linter (ESLint)"
	@echo "  make format-frontend  - Format frontend code (Prettier)"
	@echo "  make clean            - Clean cache and build files"

# 依存関係のインストール
install:
	@echo "📦 Installing backend dependencies..."
	cd backend && uv sync
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed!"

# バックエンド: Linter (Ruff)
lint-backend:
	@echo "🔍 Running backend linter (ruff)..."
	cd backend && uv run ruff check app/

# バックエンド: Formatter (Ruff)
format-backend:
	@echo "✨ Formatting backend code (ruff)..."
	cd backend && uv run ruff format app/
	cd backend && uv run ruff check --fix app/

# バックエンド: Type Checker (mypy)
typecheck-backend:
	@echo "🔍 Running backend type checker (mypy)..."
	cd backend && uv run ty check app/

# フロントエンド: Linter (ESLint)
lint-frontend:
	@echo "🔍 Running frontend linter (ESLint)..."
	cd frontend && npm run lint

# フロントエンド: Formatter (Prettier)
format-frontend:
	@echo "✨ Formatting frontend code (Prettier)..."
	cd frontend && npm run format

# 両方: Linter
lint: lint-backend lint-frontend
	@echo "✅ All linting complete!"

# 両方: Formatter
format: format-backend format-frontend
	@echo "✅ All formatting complete!"

# バックエンド: Type Checker
typecheck: typecheck-backend
	@echo "✅ Type checking complete!"

# 両方のサーバーを起動（並列実行）
launch:
	@echo "🚀 Launching backend and frontend servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "Press Ctrl+C to stop both servers"
	@trap 'kill 0' INT; \
	(cd backend && uv run uvicorn main:app --reload) & \
	(cd frontend && npm run dev) & \
	wait

# キャッシュとビルドファイルのクリーンアップ
clean:
	@echo "🧹 Cleaning cache and build files..."
	find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find backend -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/.next
	rm -rf frontend/out
	@echo "✅ Cleanup complete!"
