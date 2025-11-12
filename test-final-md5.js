// MD5算法验证测试脚本
// 复制主要MD5函数用于测试

function builtinMD5(str) {
    // MD5算法的核心常量
    const S = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    
    const K = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];
    
    // 初始化MD5变量
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;
    
    // 转换输入为字节数组
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const bytes = Array.from(data);
    const originalLength = bytes.length;
    
    // 计算填充长度
    const bitLength = originalLength * 8;
    const padLength = ((56 - (originalLength % 64) + 64) % 64) + 8;
    const paddedLength = originalLength + padLength;
    
    // 创建填充后的数据
    const paddedBytes = new Array(paddedLength);
    for (let i = 0; i < originalLength; i++) {
        paddedBytes[i] = bytes[i];
    }
    paddedBytes[originalLength] = 0x80;
    
    // 添加长度信息（64位，little-endian）
    for (let i = 0; i < 8; i++) {
        paddedBytes[paddedLength - 8 + i] = (bitLength >>> (i * 8)) & 0xff;
    }
    
    // 处理512位块
    for (let i = 0; i < paddedBytes.length; i += 64) {
        const X = new Array(16);
        for (let j = 0; j < 16; j++) {
            const idx = i + j * 4;
            X[j] = (paddedBytes[idx] | (paddedBytes[idx + 1] << 8) | (paddedBytes[idx + 2] << 16) | (paddedBytes[idx + 3] << 24)) >>> 0;
        }
        
        let A = a, B = b, C = c, D = d;
        
        // 64轮主循环
        for (let j = 0; j < 64; j++) {
            let F, g;
            if (j < 16) {
                F = (B & C) | ((~B) & D);
                g = j;
            } else if (j < 32) {
                F = (D & B) | ((~D) & C);
                g = (5 * j + 1) % 16;
            } else if (j < 48) {
                F = B ^ C ^ D;
                g = (3 * j + 5) % 16;
            } else {
                F = C ^ (B | (~D));
                g = (7 * j) % 16;
            }
            
            const temp = D;
            D = C;
            C = B;
            const sum = (A + F + K[j] + X[g]) >>> 0;
            B = (B + ((sum << S[j]) | (sum >>> (32 - S[j])))) >>> 0;
            A = temp;
        }
        
        a = (a + A) >>> 0;
        b = (b + B) >>> 0;
        c = (c + C) >>> 0;
        d = (d + D) >>> 0;
    }
    
    // 转换为小写十六进制字符串
    return (
        [a & 0xff, (a >> 8) & 0xff, (a >> 16) & 0xff, (a >> 24) & 0xff,
         b & 0xff, (b >> 8) & 0xff, (b >> 16) & 0xff, (b >> 24) & 0xff,
         c & 0xff, (c >> 8) & 0xff, (c >> 16) & 0xff, (c >> 24) & 0xff,
         d & 0xff, (d >> 8) & 0xff, (d >> 16) & 0xff, (d >> 24) & 0xff]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
    );
}

// 测试案例
console.log("MD5算法验证测试");
console.log("=================");

// 百度翻译API测试用例
const testInput1 = "2015063000000001hello1435660288179***78ulDjDWy7JoNVk:";
const result1 = builtinMD5(testInput1);
console.log(`百度翻译示例:`);
console.log(`输入: ${testInput1}`);
console.log(`结果: ${result1}`);

// 空字符串测试
const testInput2 = "";
const result2 = builtinMD5(testInput2);
console.log(`\n空字符串:`);
console.log(`结果: ${result2}`);
console.log(`期望: d41d8cd98f00b204e9800998ecf8427e`);
console.log(`匹配: ${result2 === "d41d8cd98f00b204e9800998ecf8427e" ? "✓" : "✗"}`);

// 中文字符测试
const testInput3 = "你好";
const result3 = builtinMD5(testInput3);
console.log(`\n中文字符:`);
console.log(`输入: ${testInput3}`);
console.log(`结果: ${result3}`);
console.log(`长度: ${result3.length} (应该是32)`);