#!/usr/bin/env node

/**
 * Raycastアイコン診断スクリプト
 * アイコンの問題を詳細に診断し、解決策を提示します
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function diagnoseIcon() {
  console.log('🔍 Raycastアイコン診断を開始します...\n');
  
  const issues = [];
  const recommendations = [];
  
  try {
    // 1. package.json の確認
    console.log('📋 1. package.json の確認');
    const packagePath = path.join(__dirname, '..', 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      issues.push('❌ package.json が見つかりません');
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const iconPath = packageJson.icon;
    
    if (!iconPath) {
      issues.push('❌ package.json に icon フィールドが設定されていません');
    } else {
      console.log(`   ✅ アイコンパス: ${iconPath}`);
    }
    
    // 2. アイコンファイルの存在確認
    console.log('\n📁 2. アイコンファイルの存在確認');
    const fullIconPath = path.join(__dirname, '..', iconPath);
    
    if (!fs.existsSync(fullIconPath)) {
      issues.push(`❌ アイコンファイルが見つかりません: ${fullIconPath}`);
      return;
    } else {
      console.log(`   ✅ アイコンファイル存在: ${fullIconPath}`);
    }
    
    // 3. ファイル権限の確認
    console.log('\n🔒 3. ファイル権限の確認');
    const stats = fs.statSync(fullIconPath);
    const permissions = (stats.mode & parseInt('777', 8)).toString(8);
    console.log(`   📊 権限: ${permissions}`);
    
    if (!stats.mode & fs.constants.R_OK) {
      issues.push('❌ アイコンファイルに読み取り権限がありません');
    } else {
      console.log('   ✅ 読み取り権限: OK');
    }
    
    // 4. アイコンの詳細分析
    console.log('\n🎨 4. アイコンの詳細分析');
    const metadata = await sharp(fullIconPath).metadata();
    
    console.log(`   📐 サイズ: ${metadata.width}x${metadata.height}`);
    console.log(`   🎭 形式: ${metadata.format}`);
    console.log(`   🌈 チャンネル: ${metadata.channels}`);
    console.log(`   🎨 パレット: ${metadata.isPalette ? 'あり' : 'なし'}`);
    console.log(`   👻 アルファ: ${metadata.hasAlpha ? 'あり' : 'なし'}`);
    console.log(`   📏 ファイルサイズ: ${stats.size} bytes`);
    
    // Raycast要件のチェック
    console.log('\n✅ 5. Raycast要件チェック');
    
    // サイズチェック
    if (metadata.width !== 64 || metadata.height !== 64) {
      issues.push(`❌ アイコンサイズが推奨値と異なります (現在: ${metadata.width}x${metadata.height}, 推奨: 64x64)`);
      recommendations.push('🔧 64x64ピクセルにリサイズしてください');
    } else {
      console.log('   ✅ サイズ: 64x64 (推奨)');
    }
    
    // 形式チェック
    if (metadata.format !== 'png') {
      issues.push(`❌ アイコン形式が推奨値と異なります (現在: ${metadata.format}, 推奨: PNG)`);
      recommendations.push('🔧 PNG形式に変換してください');
    } else {
      console.log('   ✅ 形式: PNG');
    }
    
    // パレットチェック
    if (metadata.isPalette) {
      issues.push('❌ パレット形式のPNGです (推奨: 真彩色)');
      recommendations.push('🔧 真彩色PNG形式に変換してください');
    } else {
      console.log('   ✅ 形式: 真彩色PNG');
    }
    
    // アルファチャンネルチェック
    if (!metadata.hasAlpha) {
      issues.push('❌ アルファチャンネルがありません');
      recommendations.push('🔧 透明度対応のPNG形式にしてください');
    } else {
      console.log('   ✅ アルファチャンネル: あり');
    }
    
    // ファイルサイズチェック
    if (stats.size > 100000) { // 100KB
      issues.push(`⚠️  ファイルサイズが大きいです (${Math.round(stats.size/1024)}KB)`);
      recommendations.push('🔧 ファイルサイズを最適化してください');
    } else {
      console.log(`   ✅ ファイルサイズ: ${Math.round(stats.size/1024)}KB (適切)`);
    }
    
    // 6. Raycast設定ファイルの確認
    console.log('\n⚙️  6. Raycast設定の確認');
    const raycastConfigPath = path.join(process.env.HOME, '.raycast');
    
    if (fs.existsSync(raycastConfigPath)) {
      console.log('   ✅ Raycast設定ディレクトリ: 存在');
    } else {
      issues.push('❌ Raycast設定ディレクトリが見つかりません');
    }
    
    // 7. 結果の表示
    console.log('\n' + '='.repeat(60));
    console.log('📊 診断結果');
    console.log('='.repeat(60));
    
    if (issues.length === 0) {
      console.log('🎉 すべてのチェックに合格しました！');
      console.log('\n💡 それでもアイコンが表示されない場合:');
      console.log('   1. Raycastを完全に再起動してください');
      console.log('   2. npm run dev で開発モードを再起動してください');
      console.log('   3. Raycast設定 > Extensions でエクステンションを確認してください');
    } else {
      console.log('⚠️  以下の問題が見つかりました:\n');
      issues.forEach(issue => console.log(`   ${issue}`));
      
      if (recommendations.length > 0) {
        console.log('\n💡 推奨される修正:\n');
        recommendations.forEach(rec => console.log(`   ${rec}`));
      }
    }
    
    console.log('\n🔧 自動修正を実行しますか？ (npm run create-icon で実行可能)');
    
  } catch (error) {
    console.error('❌ 診断中にエラーが発生しました:', error);
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  diagnoseIcon();
}

module.exports = { diagnoseIcon };
