#!/usr/bin/env node

/**
 * Discord Slash Commands 部署腳本
 * 
 * 用途：獨立部署 Slash Commands 到 Discord，不需啟動 Bot
 * 
 * 使用方式：
 *   npm run deploy:commands
 * 
 * 支援模式：
 *   - development：部署 Guild Commands 到指定伺服器（快速測試）
 *   - production：部署 Global Commands 到所有伺服器（1 小時後生效）
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

// 導入設定
const discordConfig = require('../src/config/discord');

const TOKEN = discordConfig.TOKEN;
const CLIENT_ID = discordConfig.CLIENT_ID;
const GUILD_ID = discordConfig.GUILD_ID;
const ENVIRONMENT = discordConfig.ENVIRONMENT;

// 驗證部署前置條件
function validateDeploymentSetup() {
  if (!TOKEN) {
    console.error('[DEPLOY] ❌ Missing DISCORD_TOKEN');
    process.exit(1);
  }

  if (!CLIENT_ID) {
    console.error('[DEPLOY] ❌ Missing DISCORD_CLIENT_ID');
    process.exit(1);
  }

  if (ENVIRONMENT === 'development' && !GUILD_ID) {
    console.error('[DEPLOY] ❌ development 模式需要 DISCORD_GUILD_ID');
    console.error('[DEPLOY] ℹ️  請在 .env 中設定 DISCORD_GUILD_ID=<你的伺服器ID>');
    process.exit(1);
  }

  if (ENVIRONMENT !== 'development' && ENVIRONMENT !== 'production') {
    console.error('[DEPLOY] ❌ Invalid DISCORD_ENV. Must be "development" or "production"');
    process.exit(1);
  }
}

/**
 * 收集所有 Slash Command 定義
 */
function collectSlashCommands() {
  const slashCommandPayload = [];
  const commandRoots = [
    path.join(__dirname, '../commands'),
    path.join(__dirname, '../custom-commands'),
  ];

  function collectJsFiles(directory) {
    if (!fs.existsSync(directory)) return [];

    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      if (entry.name.startsWith('_')) continue;

      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...collectJsFiles(fullPath));
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const commandFiles = commandRoots.flatMap((dir) => collectJsFiles(dir));
  
  for (const filePath of commandFiles) {
    const label = path.relative(__dirname, filePath);
    try {
      const command = require(filePath);
      if (!command?.data || typeof command.execute !== 'function') {
        console.warn(`[DEPLOY] ⚠️  Skipped invalid command module: ${label}`);
        continue;
      }

      slashCommandPayload.push(command.data.toJSON());
    } catch (error) {
      console.error(`[DEPLOY] ❌ Failed to load command "${label}":`, error.message);
    }
  }

  return slashCommandPayload;
}

/**
 * 主部署函數
 */
async function deployCommands() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 Discord Slash Commands 部署工具');
    console.log('='.repeat(80));

    // 第 1 步：驗證設定
    console.log('\n[STEP 1] 驗證設定...');
    validateDeploymentSetup();
    console.log(`  ✅ Token: ${TOKEN.substring(0, 10)}***`);
    console.log(`  ✅ Client ID: ${CLIENT_ID}`);
    console.log(`  ✅ Environment: ${ENVIRONMENT}`);
    if (ENVIRONMENT === 'development') {
      console.log(`  ✅ Guild ID: ${GUILD_ID}`);
    }

    // 第 2 步：收集指令
    console.log('\n[STEP 2] 收集 Slash Commands...');
    const slashCommandPayload = collectSlashCommands();
    console.log(`  ✅ 找到 ${slashCommandPayload.length} 個指令`);

    if (slashCommandPayload.length === 0) {
      console.error('  ❌ 沒有發現任何 Slash Commands！');
      process.exit(1);
    }

    // 第 3 步：部署指令
    console.log('\n[STEP 3] 部署指令...');
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    let deployedCommands;
    if (ENVIRONMENT === 'development') {
      console.log(`  → 部署 Guild Commands 到伺服器 ${GUILD_ID}`);
      deployedCommands = await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: slashCommandPayload }
      );
      console.log(`  ✅ 部署成功！${slashCommandPayload.length} 個指令已立即在伺服器內可用`);
    } else {
      console.log(`  → 部署 Global Commands`);
      deployedCommands = await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: slashCommandPayload }
      );
      console.log(
        `  ✅ 部署成功！${slashCommandPayload.length} 個指令已提交。\n` +
        `  ⏱️  Global Commands 可能需要 1 小時才會在所有伺服器顯示。`
      );
    }

    // 第 4 步：顯示部署結果
    console.log('\n[STEP 4] 部署結果:');
    console.log('  指令清單：');
    deployedCommands.forEach((cmd) => {
      console.log(`    • /${cmd.name}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✨ 部署完成！');
    console.log('='.repeat(80) + '\n');

    console.log('📝 後續步驟：');
    if (ENVIRONMENT === 'development') {
      console.log('  1. 啟動 Bot：npm start');
      console.log('  2. 進入 Discord 伺服器');
      console.log('  3. 在訊息框輸入 "/" 查看可用指令');
      console.log('  4. 測試指令（如 /help, /setup, 等）');
    } else {
      console.log('  1. 等待 1 小時讓 Global Commands 生效');
      console.log('  2. 邀請 Bot 到其他伺服器');
      console.log('  3. 在 Discord 輸入 "/" 查看可用指令');
    }

    console.log('\n💡 其他有用的指令：');
    console.log('  • npm start         - 啟動 Bot');
    console.log('  • npm run dev       - 啟動 Bot（開發模式，自動重載）');
    console.log('  • npm run deploy:commands - 重新部署指令\n');

  } catch (error) {
    console.error('\n[DEPLOY] ❌ 部署失敗！');
    console.error(`錯誤訊息：${error.message}\n`);

    // 常見錯誤診斷
    if (error.message.includes('Invalid token')) {
      console.error('💡 診斷：Token 無效或已過期');
      console.error('   → 請在 Discord Developer Portal 重新複製新的 Token');
    } else if (error.message.includes('Unknown Application')) {
      console.error('💡 診斷：Client ID 無效');
      console.error('   → 請確認 DISCORD_CLIENT_ID 正確');
    } else if (error.message.includes('Unknown Guild')) {
      console.error('💡 診斷：Guild ID 無效或 Bot 不在該伺服器');
      console.error('   → 請確認 DISCORD_GUILD_ID 正確');
      console.error('   → 確認 Bot 已被邀請到該伺服器');
    }

    process.exit(1);
  }
}

// 執行部署
deployCommands();
