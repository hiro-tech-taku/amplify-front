# sns-camp-front を AWS Amplify にデプロイする手順書

## 概要

このドキュメントでは、`sns-camp-front`（Next.js 14 アプリ）を GitHub 経由で AWS Amplify にデプロイし、Web ブラウザからアクセスできるようにするまでの手順を説明します。

---

## 前提条件

- GitHub アカウントを持っていること
- AWS アカウントを持っていること
- `sns-camp-front` のソースコードが手元にあること
- バックエンド API（`sns-camp-api`）がすでにデプロイ済みであること（Amplify からアクセスできる URL が必要）

---

## ステップ 1: GitHub にリポジトリを作成してプッシュ

### 1-1. GitHub でリポジトリを新規作成

1. [https://github.com](https://github.com) にログイン
2. 右上の `+` → `New repository` をクリック
3. 以下の設定でリポジトリを作成
   - **Repository name**: `sns-camp-front`（任意）
   - **Visibility**: `Public` または `Private`（どちらでも可）
   - `Initialize this repository with a README` は **チェックしない**
4. `Create repository` をクリック

### 1-2. ローカルからプッシュ

ターミナルで `sns-camp-front` ディレクトリに移動して以下を実行します。

```bash
cd sns-camp-front

# Gitがまだ初期化されていない場合
git init
git add .
git commit -m "Initial commit"

# GitHubのリポジトリをリモートとして追加（URLは自分のものに変更）
git remote add origin https://github.com/<あなたのユーザー名>/sns-camp-front.git
git branch -M main
git push -u origin main
```

---

## ステップ 2: next.config.js の確認・修正

Amplify は Next.js の SSR に対応していますが、`output: 'standalone'` は Amplify のマネージドデプロイでは**不要**または競合することがあります。Amplify を使う場合は設定を変更します。

`next.config.js` を以下のように修正してください。

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone' は Amplify では削除する
}

module.exports = nextConfig
```

変更後、コミット・プッシュします。

```bash
git add next.config.js
git commit -m "Remove standalone output for Amplify"
git push
```

---

## ステップ 3: AWS Amplify でアプリをセットアップ

### 3-1. Amplify コンソールを開く

1. [https://console.aws.amazon.com/amplify](https://console.aws.amazon.com/amplify) にアクセス
2. 右上のリージョンを任意のリージョン（例: `ap-northeast-1 東京`）に設定
3. `新しいアプリを作成` をクリック

### 3-2. GitHub と連携

1. `Git プロバイダーからデプロイ` を選択
2. `GitHub` を選択し `次へ` をクリック
3. `GitHub で認証` をクリックして GitHub の認証フローを完了
4. `リポジトリを選択` から `sns-camp-front` を選択
5. `ブランチ` は `main` を選択
6. `次へ` をクリック

### 3-3. ビルド設定を確認

Amplify が自動で Next.js を検出し、以下のようなビルド設定を生成します。必要に応じて確認・修正してください。

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

`次へ` をクリックします。

---

## ステップ 4: 環境変数を設定

このアプリはバックエンド API の URL を環境変数 `NEXT_PUBLIC_API_URL` で参照しています。

### 4-1. 環境変数の追加

ビルド設定の確認画面（または後から `環境変数` メニュー）で以下を追加します。

| キー | 値 |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://あなたのバックエンドAPIのURL/api/v1` |

> **例**: バックエンドを EC2 や ECS などにデプロイしている場合は、そのパブリック URL を指定します。  
> ローカルの `http://localhost:8080` は Amplify 上では使えないため、必ず本番用の URL に変更してください。

### 4-2. 後から環境変数を変更する場合

1. Amplify コンソールでアプリを開く
2. 左メニューの `ホスティング` → `環境変数` をクリック
3. 変数を追加・編集して `保存`
4. 再デプロイが必要な場合は `再デプロイ` ボタンをクリック

---

## ステップ 5: デプロイを実行

1. 設定内容を確認し `保存してデプロイ` をクリック
2. Amplify がビルド・デプロイを自動実行します（通常 3〜10 分程度）
3. 各ステップ（プロビジョニング → ビルド → デプロイ → 検証）が順番に完了するのを待ちます

---

## ステップ 6: Web ブラウザからアクセス

デプロイが完了すると、Amplify が自動生成した URL が表示されます。

```
https://<ブランチ名>.<アプリID>.amplifyapp.com
```

例:
```
https://main.d1abc2defg3hij.amplifyapp.com
```

この URL にブラウザからアクセスし、アプリが正常に表示されることを確認してください。

---

## ステップ 7: カスタムドメインを設定する（任意）

独自ドメインを使いたい場合は以下の手順で設定できます。

1. Amplify コンソールでアプリを開く
2. 左メニューの `ホスティング` → `カスタムドメイン` をクリック
3. `ドメインを追加` から所有しているドメインを入力
4. DNS 設定（CNAME または ALIAS レコード）を指示に従って行う
5. SSL 証明書は Amplify が自動で発行します（AWS Certificate Manager 経由）

---

## 自動デプロイについて

GitHub の `main` ブランチにプッシュするたびに Amplify が自動的にビルド・デプロイを実行します。CI/CD の設定は不要です。

```
git push origin main
         ↓
Amplify が自動検知
         ↓
ビルド & デプロイ実行
         ↓
最新版が公開される
```

---

## トラブルシューティング

### ビルドが失敗する

- Amplify コンソールの `ビルドログ` を確認して、エラー内容を確認します
- `node_modules` のバージョン不整合が原因の場合は `npm ci` が使われているか確認
- Node.js バージョンを指定したい場合は、ビルド設定に以下を追加します

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 20
        - npm ci
```

### API に接続できない

- `NEXT_PUBLIC_API_URL` の環境変数が正しく設定されているか確認
- バックエンド API の CORS 設定で Amplify の URL（`*.amplifyapp.com`）が許可されているか確認
- API のセキュリティグループやファイアウォールで 443/80 ポートが開放されているか確認

### ページが 404 になる

- Next.js の動的ルーティング（`[id]`, `[username]` など）を使っている場合、Amplify のリライトルールを確認
- 必要に応じてカスタムルール設定を追加します（通常は Amplify が自動設定）

---

## 参考リンク

- [AWS Amplify 公式ドキュメント](https://docs.aws.amazon.com/amplify/)
- [Next.js on Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-nextjs.html)
- [Amplify 環境変数の設定](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
