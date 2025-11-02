#!/usr/bin/env node

/**
 * Raycast用アイコン作成スクリプト
 * 複数の形式とサイズでアイコンを生成し、Raycastでの表示を確実にします
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createRaycastIcon() {
  const sourceIcon = path.join(__dirname, '..', 'icon-original.png');
  const outputDir = path.join(__dirname, '..');
  
  console.log('🚀 Raycast用アイコンの生成を開始します...');
  
  try {
    // ソースアイコンの確認
    if (!fs.existsSync(sourceIcon)) {
      throw new Error('ソースアイコンが見つかりません: ' + sourceIcon);
    }
    
    const metadata = await sharp(sourceIcon).metadata();
    console.log('📋 ソースアイコン情報:', {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels
    });
    
    // Raycast推奨の64x64アイコンを生成
    console.log('🎨 64x64 Raycast推奨アイコンを生成中...');
    await sharp(sourceIcon)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // 透明背景
      })
      .png({
        compressionLevel: 9, // 最高圧縮
        palette: false,
        quality: 100,
        progressive: false,
        adaptiveFiltering: true
      })
      .toFile(path.join(outputDir, 'icon.png'));
    
    // バックアップ用の512x512アイコンも生成
    console.log('💾 512x512 バックアップアイコンを生成中...');
    await sharp(sourceIcon)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({
        compressionLevel: 6,
        palette: false,
        quality: 100,
        progressive: false
      })
      .toFile(path.join(outputDir, 'icon-512.png'));
    
    // 生成されたアイコンの検証
    const generatedIcon = path.join(outputDir, 'icon.png');
    const generatedMetadata = await sharp(generatedIcon).metadata();
    
    console.log('✨ 生成されたアイコン情報:', {
      format: generatedMetadata.format,
      width: generatedMetadata.width,
      height: generatedMetadata.height,
      channels: generatedMetadata.channels,
      isPalette: generatedMetadata.isPalette,
      hasAlpha: generatedMetadata.hasAlpha,
      fileSize: fs.statSync(generatedIcon).size + ' bytes'
    });
    
    // Raycast要件の確認
    const requirements = {
      format: generatedMetadata.format === 'png',
      size: generatedMetadata.width === 64 && generatedMetadata.height === 64,
      notPalette: !generatedMetadata.isPalette,
      hasAlpha: generatedMetadata.hasAlpha
    };
    
    console.log('📋 Raycast要件チェック:');
    console.log('  ✅ PNG形式:', requirements.format ? '✓' : '✗');
    console.log('  ✅ 64x64サイズ:', requirements.size ? '✓' : '✗');
    console.log('  ✅ 非パレット形式:', requirements.notPalette ? '✓' : '✗');
    console.log('  ✅ アルファチャンネル:', requirements.hasAlpha ? '✓' : '✗');
    
    const allRequirementsMet = Object.values(requirements).every(Boolean);
    
    if (allRequirementsMet) {
      console.log('🎉 すべてのRaycast要件を満たしています！');
    } else {
      console.log('⚠️  一部の要件が満たされていません。');
    }
    
    console.log('✅ アイコン生成が完了しました！');
    
  } catch (error) {
    console.error('❌ アイコン生成中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  createRaycastIcon();
}

module.exports = { createRaycastIcon };
