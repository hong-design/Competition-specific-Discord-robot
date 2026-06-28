/**
 * discord.js 統一設定模組
 * 所有 Discord Bot 相關的配置必須通過此模組讀取
 * 
 * 這個模組確保：
 * 1. 所有必需的環境變數都被驗證
 * 2. 環境變數的值經過基本淨化
 * 3. 提供清晰的錯誤訊息
 * 4. 不會輸出敏感資訊到 console
 */

/**
 * 驗證與淨化環境變數
 * @param {string} value - 環境變數值
 * @returns {string|null} - 淨化後的值或 null
 */
function sanitizeEnvValue(value) {
  if (!value) return null;
  return String(value).trim() || null;
}

/**
 * 驗證 Discord Snowflake ID（17-20 位數字）
 * @param {string} id - 要驗證的 ID
 * @returns {boolean}
 */
function isValidSnowflakeId(id) {
  if (!id) return false;
  return /^\d{17,20}$/.test(String(id).trim());
}

// 讀取環境變數
const RAW_TOKEN = sanitizeEnvValue(process.env.DISCORD_TOKEN);
const RAW_CLIENT_ID = sanitizeEnvValue(process.env.DISCORD_CLIENT_ID);
const RAW_GUILD_ID = sanitizeEnvValue(process.env.DISCORD_GUILD_ID);
const RAW_ENV = sanitizeEnvValue(process.env.DISCORD_ENV) || 'development';
const RAW_AUTO_REGISTER_COMMANDS = sanitizeEnvValue(process.env.DISCORD_AUTO_REGISTER_COMMANDS);

// 驗證環境值
const validEnvironments = ['development', 'production'];
const ENV = validEnvironments.includes(RAW_ENV.toLowerCase()) 
  ? RAW_ENV.toLowerCase() 
  : 'development';

const AUTO_REGISTER_COMMANDS = RAW_AUTO_REGISTER_COMMANDS?.toLowerCase() === 'true';

// 收集驗證錯誤
const validationErrors = [];

// 驗證 Token
if (!RAW_TOKEN) {
  validationErrors.push('[CONFIG ERROR] 缺少 DISCORD_TOKEN。');
  validationErrors.push('[CONFIG HELP] 請在 .env 檔案中填入你的 Discord Bot Token。');
  validationErrors.push('[CONFIG HELP] 取得方式：https://discord.com/developers/applications → Bot → Copy Token');
}

// 驗證 Client ID
if (!RAW_CLIENT_ID) {
  validationErrors.push('[CONFIG ERROR] 缺少 DISCORD_CLIENT_ID。');
  validationErrors.push('[CONFIG HELP] 請在 .env 檔案中填入你的 Discord Application ID。');
  validationErrors.push('[CONFIG HELP] 取得方式：https://discord.com/developers/applications → 你的應用程式 → APPLICATION ID');
} else if (!isValidSnowflakeId(RAW_CLIENT_ID)) {
  validationErrors.push(`[CONFIG ERROR] DISCORD_CLIENT_ID 無效：${RAW_CLIENT_ID}`);
  validationErrors.push('[CONFIG HELP] Client ID 應該是 17-20 位的數字。');
}

// 驗證 Guild ID（development 模式時必需）
if (ENV === 'development') {
  if (!RAW_GUILD_ID) {
    validationErrors.push('[CONFIG ERROR] development 模式需要 DISCORD_GUILD_ID。');
    validationErrors.push('[CONFIG HELP] 請在 .env 檔案中填入你要測試的 Discord 伺服器 ID。');
    validationErrors.push('[CONFIG HELP] 取得方式：在 Discord 伺服器內右鍵 → 複製伺服器 ID');
  } else if (!isValidSnowflakeId(RAW_GUILD_ID)) {
    validationErrors.push(`[CONFIG ERROR] DISCORD_GUILD_ID 無效：${RAW_GUILD_ID}`);
    validationErrors.push('[CONFIG HELP] Guild ID 應該是 17-20 位的數字。');
  }

  // 驗證 Client ID 與 Guild ID 是否相同（常見錯誤）
  if (RAW_CLIENT_ID && RAW_GUILD_ID && RAW_CLIENT_ID === RAW_GUILD_ID) {
    validationErrors.push('[CONFIG ERROR] DISCORD_GUILD_ID 不可與 DISCORD_CLIENT_ID 相同。');
    validationErrors.push('[CONFIG HELP] 請填入 Discord 伺服器 ID，而非 Bot Application ID。');
  }
}

// 如果有驗證錯誤，輸出並終止
if (validationErrors.length > 0) {
  console.error('\n' + '='.repeat(80));
  console.error('⚠️  設定驗證失敗');
  console.error('='.repeat(80));
  validationErrors.forEach(msg => console.error(msg));
  console.error('='.repeat(80) + '\n');
  process.exit(1);
}

// 正式設定值
const TOKEN = RAW_TOKEN;
const CLIENT_ID = RAW_CLIENT_ID;
const GUILD_ID = RAW_GUILD_ID || null; // production 時可能為 null
const ENVIRONMENT = ENV;

/**
 * 設定物件
 * 其他模組應該通過 require 導入此物件
 */
const config = {
  // Discord 認證
  TOKEN,
  CLIENT_ID,
  GUILD_ID,
  ENVIRONMENT,

  /**
   * 是否為 development 模式
   * development：快速部署 Guild Commands 到指定伺服器
   * production：部署 Global Commands 到所有伺服器
   */
  isDevelopment: ENVIRONMENT === 'development',
  isProduction: ENVIRONMENT === 'production',
  AUTO_REGISTER_COMMANDS,

  /**
   * 取得設定簡述（用於啟動訊息）
   */
  getSummary() {
    return {
      environment: ENVIRONMENT,
      clientId: CLIENT_ID,
      guildId: GUILD_ID || '未設定（production 模式）',
      tokenLength: TOKEN.length,
      tokenPreview: TOKEN.substring(0, 10) + '***', // 不顯示完整 Token
    };
  },

  /**
   * 驗證 Bot 是否可以在指定 Guild 中部署指令
   * 用於 deploy-commands.js 中的前置檢查
   */
  validateGuildDeployment() {
    if (this.isDevelopment && !this.GUILD_ID) {
      throw new Error(
        '[CONFIG] development 模式需要有效的 DISCORD_GUILD_ID。\n' +
        '請在 .env 中設定 DISCORD_GUILD_ID=你的伺服器ID'
      );
    }
    return true;
  },
};

// 凍結設定物件，防止意外修改
Object.freeze(config);

module.exports = config;
