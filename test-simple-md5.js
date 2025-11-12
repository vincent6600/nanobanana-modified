// 简化版MD5测试 - 用于验证算法正确性
function simpleMD5(input) {
    // 将字符串转换为字节数组
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    
    // 初始化MD5计算所需的常量
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
    
    // 初始化变量
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;
    
    // 将数据转换为32位整数数组
    const message = new Array(16);
    for (let i = 0; i < 64; i += 4) {
        message[i >> 2] = data[i] | (data[i + 1] << 8) | (data[i + 2] << 16) | (data[i + 3] << 24);
    }
    
    // 补位：先添加一个"1"比特，然后添加"0"比特直到长度符合MD5要求
    const originalLength = data.length;
    const newLength = ((originalLength + 8) >> 6) << 6 + 56;
    const paddedData = new Array(newLength + 64);
    
    for (let i = 0; i < data.length; i++) {
        paddedData[i] = data[i];
    }
    
    paddedData[data.length] = 0x80;
    paddedData[newLength] = originalLength * 8 & 0xff;
    paddedData[newLength + 1] = originalLength * 8 >> 8 & 0xff;
    paddedData[newLength + 2] = originalLength * 8 >> 16 & 0xff;
    paddedData[newLength + 3] = originalLength * 8 >> 24 & 0xff;
    
    // 处理512位块
    for (let i = 0; i < paddedData.length; i += 64) {
        const chunk = new Array(16);
        for (let j = 0; j < 16; j++) {
            chunk[j] = paddedData[i + j * 4] | (paddedData[i + j * 4 + 1] << 8) | 
                      (paddedData[i + j * 4 + 2] << 16) | (paddedData[i + j * 4 + 3] << 24);
        }
        
        let A = a, B = b, C = c, D = d;
        
        for (let j = 0; j < 64; j++) {
            let F, g;
            if (j < 16) {
                F = (B & C) | (~B & D);
                g = j;
            } else if (j < 32) {
                F = (D & B) | (~D & C);
                g = (5 * j + 1) % 16;
            } else if (j < 48) {
                F = B ^ C ^ D;
                g = (3 * j + 5) % 16;
            } else {
                F = C ^ (B | ~D);
                g = (7 * j) % 16;
            }
            
            const temp = D;
            D = C;
            C = B;
            const sum = (A + F + K[j] + chunk[g]) | 0;
            B = (B + ((sum << S[j]) | (sum >>> (32 - S[j])))) | 0;
            A = temp;
        }
        
        a = (a + A) | 0;
        b = (b + B) | 0;
        c = (c + C) | 0;
        d = (d + D) | 0;
    }
    
    // 转换为小写的16进制字符串
    return [
        a & 0xff, (a >> 8) & 0xff, (a >> 16) & 0xff, (a >> 24) & 0xff,
        b & 0xff, (b >> 8) & 0xff, (b >> 16) & 0xff, (b >> 24) & 0xff,
        c & 0xff, (c >> 8) & 0xff, (c >> 16) & 0xff, (c >> 24) & 0xff,
        d & 0xff, (d >> 8) & 0xff, (d >> 16) & 0xff, (d >> 24) & 0xff
    ].map(x => x.toString(16).padStart(2, '0')).join('');
}

// 测试案例
console.log("MD5测试结果：");

// 测试案例1：百度翻译API官方示例
const test1 = "2015063000000001hello14356628";
const result1 = simpleMD5(test1);
console.log(`测试1: "${test1}"`);
console.log(`结果: ${result1}`);
console.log(`期望: 5d41402abc4b2a76b9719d911017c592`);
console.log(`匹配: ${result1 === "5d41402abc4b2a76b9719d911017c592" ? "✓" : "✗"}`);

// 测试案例2：空字符串
const test2 = "";
const result2 = simpleMD5(test2);
console.log(`\n测试2: 空字符串`);
console.log(`结果: ${result2}`);
console.log(`期望: d41d8cd98f00b204e9800998ecf8427e`);
console.log(`匹配: ${result2 === "d41d8cd98f00b204e9800998ecf8427e" ? "✓" : "✗"}`);

// 测试案例3：中文字符
const test3 = "你好";
const result3 = simpleMD5(test3);
console.log(`\n测试3: "你好"`);
console.log(`结果: ${result3}`);
console.log(`长度: ${result3.length} (应该为32)`);