# HTML Template gulp
「gulp」を利用したフロントエンド開発タスクランナー。

## Author
<dl>
	<dt>Taku Suzuki</dt>
	<dd><a href="https://github.com/takulin8080">github.com/takulin8080</a></dd>
</dl>

## Copyright
&copy; 2017, <a href="https://github.com/takulin8080">Taku Suzuki</a>.

---

## 本プログラムの機能と目的
「フロントエンド開発者にとって、確実に必要となる機能を厳選して採用する」  
トレンドやプロジェクトによって臨機応変な対応を要求されるフロントエンド開発において、最適化可能なタスクランナーの必要性を感じ、様々な問題に対して柔軟な対応力を持つ「フロントエンド開発の基盤」になることを目指して開発。  

サイトを構成する要素を可能な限り「json」で管理し、制作過程において意識せずともコーディング規約が厳格なものになるよう設計。長期的なサイト運用と再利用可能なHTML作成の実現をコンセプトにしている。  
また、一つのプロジェクト内において、開発メンバーそれぞれのスキルに合わせたコーディングの実装（実験）が可能なファイル構成と開発フローを構築。開発者の育成にも重点を置き、無駄にならない開発環境の提供についても研究。

### 「json」管理リスト

#### 主要構成要素
- サイト情報  
/dev/src/_data/_variabble.json
- ページ構成  
/dev/src/_data/page.json
- レイアウト  
/dev/src/_data/layout.json
- 汎用パーツ  
/dev/src/_data/module.json

#### 「json-ld / schema.org」専用
- LocalBusiness  
/dev/src/_data/LocalBusiness/*.json
- Organization  
/dev/src/_data/Organization/*.json
- Person  
/dev/src/_data/Person/*.json
- 記事要素（パスおよび内容は「article」としているが「news」などに任意で変更可能）  
/dev/src/_data/article/*.json

#### その他
- 開発用ページ（サイト構成、パーツなどの閲覧に利用）  
/dev/src/_data/_dev/page.json
- 自動出力ファイル用（ejs, scss, imgフォルダの生成に利用）  
/dev/src/_data/_dev/file-setup.json
- サンプルテキスト  
/dev/src/_data/_dev/exsample.json

---

## 動作環境
- node version 12.x.x
- npm version 6.x.x

## メインタスク実行内容

- _run  
開発用の出力ファイルを「/dev/dstフォルダ」に生成、ブラウザプレビュー。
- _release  
本番用の出力ファイルを「/releaseフォルダ」に生成、ブラウザプレビュー。  
不要ファイルが残さないため、実行時に「/releaseフォルダ」を一時的に削除。
- _clean  
開発時に生成される開発用ファイル群を削除。  
不要ファイル（使用していない画像、アイコンなど...）が増えた場合に利用。

---

## バージョン履歴
- 3.2.1 | 2019.11.24
- 3.1.3 | 2019.10.04
- 3.1.2 | 2019.09.30
- 3.1.1 | 2019.09.26
- 3.0.0 | 2019.07.16
- 0.0.0 | Before 3.0.0

### 3.2.1
軽微なアップデート。

### 3.1.3
メインタスクの実行内容調整、その他軽微なアップデート。

### 3.1.2
軽微なアップデート。

### 3.1.1
ファイ構成調整、その他軽微なアップデート。

#### 動作環境
- node version 12.11.0
- npm version 6.11.3

### 3.0.0
本バージョンより「readme.md」を作成。

#### 動作環境
- node version 12.6.0
- npm version 6.10.0

#### gulp メインタスク 実行内容
- _run  
開発用の出力ファイルを「『/dev/dst』フォルダ」に生成、プレビュー。
- _release  
本番用の出力ファイルを「『/release』フォルダ」に生成、プレビュー。  
不要ファイルを残さないため、実行時に「『/release』フォルダが一時的に削除」される。  
また「『/dev/dst』フォルダ」も合わせて削除」される。
- _clean
開発時に生成される「開発用ファイル群」を削除。  
不要なファイル（使用していない画像、アイコンなど...）が増えた場合に利用。

### 0.0.0 (3.0.0以前)
「readme」なし。使用非推奨。
