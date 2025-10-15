const fs = require('fs');
const archiver = require('archiver');
const { execSync } = require('child_process');

const output = fs.createWriteStream('build.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`\n✅ 打包完成，共 ${archive.pointer()} 字节`);
});

archive.on('error', err => { throw err; });

archive.pipe(output);

// Step 1: Run `npm run build`
console.log('📦 正在构建项目...');
execSync('npm run build', { stdio: 'inherit' });

// Step 2: Add required folders/files
console.log('📂 添加文件到 zip...');
archive.directory('.next/', '.next');
archive.directory('public/', 'public');
archive.file('package.json', { name: 'package.json' });

archive.finalize();
