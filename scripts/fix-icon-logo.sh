#!/bin/bash

# trace_logo_1.pngからアイコンを生成して完全リセット

echo "🔄 trace_logo_1.pngからアイコンを再生成して完全リセットします..."
echo ""

cd "$(dirname "$0")/.."

# 1. アイコンを再生成
echo "🎨 1. trace_logo_1.pngからアイコンを生成中..."
node -e "
const sharp = require('sharp');
sharp('../logo/trace_logo_1.png')
  .resize(64, 64, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .png({ compressionLevel: 6, palette: false, quality: 100 })
  .toFile('assets/icon.png')
  .then(() => console.log('✅ アイコンを生成しました'))
  .catch(err => { console.error('❌ エラー:', err.message); process.exit(1); });
"

if [ $? -ne 0 ]; then
    echo "❌ アイコンの生成に失敗しました"
    exit 1
fi

# 2. アイコンの確認
echo ""
echo "📋 2. 生成されたアイコンを確認..."
file assets/icon.png
ls -lh assets/icon.png

# 3. バージョンを更新（変更を強制）
echo ""
echo "📦 3. バージョンを更新してビルド..."
# バージョンはpackage.jsonで既に更新済み

# 4. クリーンビルド
echo ""
echo "🔨 4. クリーンビルドを実行..."
rm -rf dist/
npm run build

if [ $? -ne 0 ]; then
    echo "❌ ビルドに失敗しました"
    exit 1
fi

# 5. assetsをdistにコピー
echo ""
echo "📁 5. assetsディレクトリをdistにコピー..."
if [ -d "dist" ]; then
    cp -r assets dist/ 2>/dev/null || true
    cp assets/icon.png dist/ 2>/dev/null || true
    echo "   ✅ assetsをdistにコピーしました"
    
    # 確認
    if [ -f "dist/assets/icon.png" ] || [ -f "dist/icon.png" ]; then
        echo "   ✅ dist内にアイコンが存在します"
    else
        echo "   ⚠️  dist内にアイコンが見つかりません（手動で確認が必要）"
    fi
else
    echo "   ⚠️  distディレクトリが存在しません"
fi

# 6. Raycastを完全停止
echo ""
echo "🛑 6. Raycastを完全停止..."
pkill -f "Raycast" 2>/dev/null || true
pkill -f "ray develop" 2>/dev/null || true
sleep 2

# 7. キャッシュを完全削除
echo ""
echo "🧹 7. キャッシュを完全削除..."
rm -rf ~/Library/Application\ Support/com.raycast/Extensions/cache 2>/dev/null || true
rm -rf ~/Library/Caches/com.raycast 2>/dev/null || true
echo "   ✅ キャッシュを削除しました"

# 8. Raycastを起動
echo ""
echo "🚀 8. Raycastを起動..."
open -a "Raycast" 2>/dev/null || echo "⚠️  Raycastアプリが見つかりません"

echo ""
echo "=========================================="
echo "✅ 完了！"
echo "=========================================="
echo ""
echo "📋 重要な次のステップ:"
echo ""
echo "1. Raycast設定を開く（⌘ + ,）"
echo "2. Extensions タブを選択"
echo "3. 'trayce' エクステンションを見つける"
echo "4. 一度削除してください（右クリック > 削除 または 設定から削除）"
echo "5. + > Import Extension をクリック"
echo "6. 以下のパスを選択:"
echo ""
echo "   $(pwd)"
echo ""
echo "7. エクステンションを再インポート後、アイコンが表示されているか確認"
echo ""
echo "💡 これで trace_logo_1.png から生成したアイコンが表示されるはずです！"
echo ""
