const fs = require('fs');
const content = fs.readFileSync('frontend/src/features/help-center/index.tsx', 'utf8');

let stack = [];
let i = 0;
while (i < content.length) {
    if (content[i] === '<' && content[i+1] !== '/' && content[i+1] !== ' ' && content[i+1] !== '=') {
        const end = content.indexOf('>', i);
        if (end !== -1) {
            const tagStr = content.substring(i+1, end).split(' ')[0].replace('>', '').replace('/', '');
            if (!content.substring(i, end+1).endsWith('/>') && !['br', 'img', 'input', 'hr', 'meta', 'link'].includes(tagStr)) {
                stack.push({tag: tagStr, line: content.substring(0, i).split('\n').length});
            }
        }
    } else if (content[i] === '<' && content[i+1] === '/') {
        const end = content.indexOf('>', i);
        if (end !== -1) {
            const tagStr = content.substring(i+2, end).trim();
            const last = stack.pop();
            if (!last || last.tag !== tagStr) {
                console.log(`Mismatch at line ${content.substring(0, i).split('\n').length}: expected ${last ? last.tag : 'NONE'}, got ${tagStr}`);
            }
        }
    }
    i++;
}
if (stack.length > 0) {
    console.log("Unclosed tags:", stack);
} else {
    console.log("All tags matched perfectly.");
}
