#!/usr/bin/env node

/**
 * Raycastエクステンション用アイコン最適化スクリプト
 * アイコンを正しい形式に変換し、Raycastでの表示を確実にします
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeIcon() {
  const iconPath = path.join(__dirname, '..', 'icon.png');
  const backupPath = path.join(__dirname, '..', 'icon.backup.png');
  
  try {
    // 既存のアイコンをバックアップ
    if (fs.existsSync(iconPath)) {
      fs.copyFileSync(iconPath, backupPath);
      console.log('✅ 既存のアイコンをバックアップしました');
    }
    
    // アイコンのメタデータを確認
    const metadata = await sharp(iconPath).metadata();
    console.log('📋 現在のアイコン情報:', {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels,
      isPalette: metadata.isPalette,
      hasAlpha: metadata.hasAlpha
    });
    
    // Raycast用に最適化
    await sharp(iconPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        compressionLevel: 6,
        palette: false, // パレット形式を無効化
        quality: 100,
        progressive: false
      })
      .toFile(iconPath + '.optimized');
    
    // 最適化されたファイルで置き換え
    fs.renameSync(iconPath + '.optimized', iconPath);
    
    // 最適化後のメタデータを確認
    const optimizedMetadata = await sharp(iconPath).metadata();
    console.log('✨ 最適化後のアイコン情報:', {
      format: optimizedMetadata.format,
      width: optimizedMetadata.width,
      height: optimizedMetadata.height,
      channels: optimizedMetadata.channels,
      isPalette: optimizedMetadata.isPalette,
      hasAlpha: optimizedMetadata.hasAlpha
    });
    
    console.log('🎉 アイコンの最適化が完了しました！');
    
  } catch (error) {
    console.error('❌ アイコンの最適化中にエラーが発生しました:', error);
    
    // エラーが発生した場合はバックアップから復元
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, iconPath);
      console.log('🔄 バックアップからアイコンを復元しました');
    }
    
    process.exit(1);
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  optimizeIcon();
}

module.exports = { optimizeIcon };
