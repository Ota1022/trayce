#!/bin/bash

# Raycast完全再起動スクリプト
# アイコンの変更を確実に反映させるため

echo "🔄 Raycastを完全に再起動します..."

# Raycastプロセスを停止
echo "📱 Raycastプロセスを停止中..."
pkill -f "Raycast" 2>/dev/null || true
pkill -f "ray develop" 2>/dev/null || true

# 少し待機
sleep 2

# Raycastのキャッシュをクリア（可能な場合）
echo "🧹 キャッシュをクリア中..."
rm -rf ~/.raycast/extensions/cache/* 2>/dev/null || true
rm -rf ~/.raycast/cache/* 2>/dev/null || true

# Raycastを再起動
echo "🚀 Raycastを再起動中..."
open -a "Raycast" 2>/dev/null || echo "⚠️  Raycastアプリが見つかりません。手動で起動してください。"

echo "✅ 再起動完了！"
echo ""
echo "📋 次の手順:"
echo "1. Raycastが起動したら、⌘ + Space でRaycastを開く"
echo "2. 'trayce' または 'Create Procedures' を検索"
echo "3. アイコンが表示されているか確認"
echo ""
echo "💡 アイコンが表示されない場合:"
echo "   - Raycastの設定 > Extensions で拡張機能を確認"
echo "   - 'npm run dev' で開発モードを再起動"
