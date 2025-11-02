#!/bin/bash

# Raycastエクステンション完全リセットスクリプト

echo "🔄 Raycastエクステンションを完全リセットします..."
echo ""

# 1. Raycastを完全終了
echo "📱 1. Raycastを完全終了中..."
pkill -f "Raycast" 2>/dev/null || true
pkill -f "ray develop" 2>/dev/null || true
sleep 2

# 2. キャッシュを完全削除
echo "🧹 2. キャッシュを完全削除中..."
rm -rf ~/Library/Application\ Support/com.raycast/Extensions/cache 2>/dev/null || true
rm -rf ~/Library/Caches/com.raycast 2>/dev/null || true
echo "   ✅ キャッシュを削除しました"

# 3. ビルド
echo "📦 3. エクステンションをビルド中..."
cd "$(dirname "$0")/.."
rm -rf dist/
npm run build

if [ $? -ne 0 ]; then
    echo "❌ ビルドに失敗しました"
    exit 1
fi

echo "   ✅ ビルド完了"
echo ""

# 4. アイコンの確認
echo "🎨 4. アイコンの確認..."
if [ -f "assets/icon.png" ]; then
    echo "   ✅ assets/icon.png が見つかりました"
    file assets/icon.png
    ls -lh assets/icon.png
else
    echo "   ❌ assets/icon.png が見つかりません"
    exit 1
fi
echo ""

# 5. Raycastを起動
echo "🚀 5. Raycastを起動中..."
open -a "Raycast" 2>/dev/null || echo "⚠️  Raycastアプリが見つかりません"

echo ""
echo "=========================================="
echo "✅ リセット完了！"
echo "=========================================="
echo ""
echo "📋 次の手順:"
echo "1. Raycast設定を開く（⌘ + ,）"
echo "2. Extensions タブを選択"
echo "3. 'trayce' エクステンションを見つける"
echo "4. 一度削除してから、再度 Import Extension から追加"
echo "5. アイコンが表示されているか確認"
echo ""
echo "💡 エクステンションのパス:"
echo "   $(pwd)"
echo ""
