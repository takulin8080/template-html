# HTML Template gulp
「gulp」を利用した『フロントエンド開発 テンプレート』。

## 本プログラムの機能と目的
フロントエンド開発の経験から、本当に必要となる機能を厳選。  
トレンドに大きく左右されるフロントエンド開発。実際の案件に発生しやすい問題についても考慮したテンプレート

- サイト情報
- ページ構成
- 汎用パーツ（module）
- レイアウト
- etc...

サイトを構成する要素を、可能な限り「json」で管理し、コーディングルール」をより厳格なものにするとともに「構成の可視性」を高め、長期的な管理・運営を実現することを目的として制作。

---

## 更新履歴
- [3.0.0](#3.0.0) | 2019.07.11
- [0.0.0](#0.0.0) | 3.0.0より前

---

## バージョン履歴

### 3.0.0

本バージョンより「readme.md」を作成。

#### 動作環境
- node version 12.6.0

#### gulp メインタスク 実行名・内容

<dl>
<dt>_run</dt>
<dd>開発用の出力ファイルを「『/dev/dst』フォルダ」に生成、プレビュー。</dd>
<dt>_release</dt>
<dd>本番用の出力ファイルを「『/release』フォルダ」に生成、プレビュー。<br>「『/dev/dst』 フォルダ」を削除。</dd>
<dt>_clean</dt>
<dd>開発時に生成される「開発用ファイル群」を削除。<br>不要なファイル（使用していない画像、アイコンなど...）が増えた場合に利用。</dd>
</dl>

### 0.0.0 (3.0.0より前)

「readme」なし。使用非推奨。
