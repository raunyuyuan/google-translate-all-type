const translate = require('../google-translate-api')
/**
 * 翻译各种数据结构
 * 对象只翻译value,如果value是对象或者数组,提取出来,翻译值都是string的对象
 * 数组中有对象或者数组,提取出来,翻译都是string的数组.
 * 提取出来的数据通过递归继续处理,处理完毕对应的key放入原有的位置 
 */
const translateFullStringArray = (array, from, to = 'zh-CN') => {
    return translate(JSON.stringify(array), {
        from: from,
        to: to || 'en'
    }).then(ress => {
        let returnString = ress.text.replace(/\s*(\[|\]|“|”)\s*/g, '');
        return returnString.split('，')
    }).catch(err => {
        return []
    })
}
const translateObj = (obj, from, to = 'zh-CN') => {
    let keys = Object.keys(obj)
    const values = []
    keys.sort()
    for (let i = 0; i < keys.length; i++) {
        values.push(obj[keys[i]])
    }
    return translate(JSON.stringify(values), {
        from: from,
        to: to || 'en'
    }).then(ress => {
        let returnString = ress.text.replace(/\s*(\[|\]|“|”)\s*/g, '');
        const resultArray = returnString.split('，');
        const result = {};
        for (let i = 0; i < keys.length; i++) {
            result[keys[i]] = resultArray[i]
        }
        return result
    }).catch(err => {
        return {}
    })
}
const translateString = (string, from, to = 'zh-CN') => {
    return translate(string, {
        from: from,
        to: to || 'en'
    }).then(ress => {
        return ress.text.replace(/'|”|“/g, '')
    }).catch(err => {
        return ''
    })
}
const translateEveryType = async (target, from, to) => {
    if (target instanceof Array) {
        const notStrElems = []
        const hasObjIdxs = []
        const len = target.length
        for (let i = 0; i < len; i++) {
            const type = typeof target[i]
            if (type !== 'string' || type !== 'number') {
                notStrElems.push(target[i])
                hasObjIdxs.push(i)
            }
        }
        for (let i = 0; i < hasObjIdxs.length; i++) {
            const idx = hasObjIdxs[i] - i
            target.splice(idx, 1)
        }
        const notStrLen = notStrElems.length
        // 全都是对象
        if (notStrLen === len) {
            let newResult = []
            for (let i = 0; i < len; i++) {
                newResult[i] = await translateEveryType(notStrElems[i], from, to)
            }
            return newResult
        }
        // 存在字符串
        return translateFullStringArray(target, from, to).then(async result => {
            for (let i = 0; i < notStrLen; i++) {
                const data = await translateEveryType(notStrElems[i], from, to)
                result.splice(hasObjIdxs[i], 0 , data)
            }
        })
    } else if (typeof target === 'string' || typeof target === 'number') {
        return translateString(target, from, to).then(result => {
            return result
        })
        // if (typeof)
    } else if (typeof target === 'object') {
        const notStrElems = []
        const hasObjkeys = []
        let targetLen = 0
        for (let key in target) {
            targetLen++
            if (typeof target[key] !== 'string' || typeof target[key] !== 'number') {
                notStrElems.push(target[key])
                hasObjkeys.push(key)
            }
        }
        for (let i = 0; i < hasObjkeys.length; i++) {
            delete target[hasObjkeys[i]]
        }
        if (targetLen === hasObjkeys.length) {
            let newResult = {}
            for (let i = 0; i < targetLen; i++) {
                newResult[hasObjkeys[i]] = await translateEveryType(notStrElems[i], from, to)
            }
            return newResult
        }
        return translateObj(target, from, to).then(async result => {
            for (let i = 0; i < hasObjkeys.length; i++) {
                result[hasObjkeys[i]] = await translateEveryType(notStrElems[i], from, to)
            }
            return result
        })
    }
}

module.exports = translateEveryType
