const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取git commit ID
const commitId = execSync('git rev-parse HEAD').toString().trim();

// 定义版本信息文件路径
const versionFilePath = path.join(__dirname, 'plp-frontend', 'public', 'version.json');

// 创建版本信息对象
const versionInfo = {
  commitId: commitId,
  shortCommitId: commitId.substring(0, 7),
  buildTime: new Date().toISOString()
};

// 将版本信息写入文件
fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));

console.log('Version info generated:');
console.log(versionInfo);