<div align="center">

![Shadowing App Logo](./assets/logo.svg)

**AI駆動の次世代英語シャドーイング学習プラットフォーム**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>


## ✨ 特徴

<table>
<tr>
<td width="50%">

### 🎯 学習機能
- **🎤 リアルタイム録音** - 高品質な音声キャプチャ
- **🤖 AI フィードバック** - Gemini AIによる発音アドバイス
- **📊 詳細スコアリング** - 単語レベルの精度分析
- **📝 カスタム教材** - 自由に教材を作成可能
- **🔊 TTS生成** - ElevenLabsによる自然な音声

</td>
<td width="50%">

### 🎮 ゲーミフィケーション
- **🔥 連続記録** - 継続学習の可視化
- **⭐ XP & レベル** - 経験値システム
- **🏆 実績バッジ** - マイルストーン達成
- **🎯 デイリーゴール** - 目標グラディエント効果
- **📈 進捗追跡** - 学習履歴の可視化

</td>
</tr>
</table>

---


### 🔧 技術スタック

#### Frontend
```typescript
Next.js 15.1      // React フレームワーク
TypeScript 5.0+   // 型安全性
Tailwind CSS      // スタイリング
shadcn/ui         // UIコンポーネント
Framer Motion     // アニメーション
Zustand           // 状態管理
```

#### Backend
```python
FastAPI 0.115+        # Web フレームワーク
Python 3.11+          # 言語
Pydantic              # バリデーション
ElevenLabs API        # TTS/STT
Google Gemini         # AI フィードバック
Supabase SDK          # データベース
```

---

## 🚀 クイックスタート

### 📋 必要要件

- Node.js 18+ / npm
- Python 3.11+ / uv または pip
- Supabase アカウント（無料プランOK）
- （オプション）ElevenLabs API キー
- （オプション）Google Gemini API キー

### ⚙️ セットアップ

<details>
<summary><strong>1️⃣ データベース設定</strong></summary>

```bash
# 1. Supabase プロジェクトを作成
# https://supabase.com

# 2. SQL エディタでマイグレーションを実行
# supabase/migrations/001_initial_schema.sql の内容をコピー&実行

# 3. Storageバケットを作成
# Storage → New bucket → "audio-files" (Public)
```

</details>

<details>
<summary><strong>2️⃣ バックエンド設定</strong></summary>

```bash
cd backend

# 環境変数ファイルを作成
cat > .env << EOF
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
ELEVENLABS_API_KEY=  # オプション（空でもOK）
GOOGLE_API_KEY=      # オプション（空でもOK）
EOF

# 依存関係をインストール
uv sync

# サーバー起動
uv run uvicorn main:app --reload

# ✅ http://localhost:8000
# 📚 API Docs: http://localhost:8000/docs
```

</details>

<details>
<summary><strong>3️⃣ フロントエンド設定</strong></summary>

```bash
cd frontend

# 環境変数ファイルを作成
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

# 依存関係をインストール
npm install

# 開発サーバー起動
npm run dev

# ✅ http://localhost:3000
```

</details>

### 🎉 起動完了！

1. ブラウザで http://localhost:3000 を開く
2. 「Skip (Demo Mode)」でログイン
3. 教材を作成して練習開始！

---

## 📖 使い方

### 📝 教材作成

```
/materials/create にアクセス
  ↓
タイトル・難易度・文章を入力
  ↓
音声が自動生成される（TTS）
  ↓
教材完成！
```

### 🎤 シャドーイング練習

```
教材を選択
  ↓
Practice Mode: 音声を聴いて理解
  ↓
Recording Mode: 録音しながらシャドーイング
  ↓
AIフィードバック & スコア表示
  ↓
XP獲得 & レベルアップ！
```

---

## 🎨 UX心理学の実装

このアプリは以下の心理学原則に基づいて設計されています：

| 原則 | 実装 | 効果 |
|------|------|------|
| 🔥 **ストリークシステム** | 連続練習日数の可視化 | 継続のモチベーション |
| 🎯 **ゴールグラディエント効果** | 「あとX回で達成！」 | ゴール間近での加速 |
| 🧠 **ツァイガルニク効果** | Continue Bannerの表示 | 未完了タスクへの回帰 |
| 🎊 **ピークエンド法則** | 高スコア時の紙吹雪 | ポジティブ体験の記憶 |
| ⏱️ **労力の錯覚** | 処理中アニメーション | 品質の認知向上 |
| 📊 **進捗の可視化** | XPバー・レベル表示 | 成長の実感 |

---

## 🛠️ 開発

### プロジェクト構造

```
shadowing-app/
├── frontend/              # Next.js アプリ
│   ├── app/              # ページ（App Router）
│   ├── components/       # Reactコンポーネント
│   ├── lib/              # ユーティリティ
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript型定義
├── backend/              # FastAPI アプリ
│   ├── app/
│   │   ├── routers/     # APIエンドポイント
│   │   ├── services/    # ビジネスロジック
│   │   ├── models/      # データモデル
│   │   └── auth.py      # 認証
│   └── main.py          # エントリーポイント
├── supabase/            # データベース
│   └── migrations/      # SQLマイグレーション
└── assets/              # 静的アセット
```

### よく使うコマンド

```bash
# Backend
cd backend
uv run uvicorn main:app --reload  # 開発サーバー
uv run pytest                      # テスト実行

# Frontend
cd frontend
npm run dev                        # 開発サーバー
npm run build                      # 本番ビルド
npm run lint                       # Lint実行

# Database
# Supabase Dashboard でSQLを実行
```

### APIエンドポイント

| Method | Endpoint | 説明 |
|--------|----------|------|
| `GET` | `/health` | ヘルスチェック |
| `POST` | `/api/materials` | 教材作成 |
| `GET` | `/api/materials` | 教材一覧 |
| `GET` | `/api/materials/{id}` | 教材詳細 |
| `POST` | `/api/practice/transcribe` | 音声文字起こし |
| `POST` | `/api/practice/feedback` | AIフィードバック |
| `POST` | `/api/practice/log` | 練習ログ保存 |

詳細: http://localhost:8000/docs

---

## 🚢 デプロイ

### Backend（Railway / Render / Fly.io）

```bash
# 環境変数を設定
SUPABASE_URL=...
SUPABASE_KEY=...
SUPABASE_SERVICE_KEY=...

# 起動コマンド
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend（Vercel 推奨）

```bash
# GitHubリポジトリと連携
# 環境変数を設定
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=https://your-backend.com

# 自動デプロイ 🚀
```

---

## 🤝 コントリビューション

このプロジェクトは個人開発ですが、フィードバックや提案は大歓迎です！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'feat: add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

---
