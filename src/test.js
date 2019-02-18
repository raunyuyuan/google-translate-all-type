const translateEveryType = require('./translate')

translateEveryType('I love China').then(res => {
    console.log(res)
})

translateEveryType([
    {a: "Someone says, I'm a handsome man, these people : b", b: ['beauty', 'god', 'monster']},
    {b: "test the program is a boring thing but important", c: "I don't want to use jest to test my program, it will take more time to study. To be honest, I hate doing anything troublesome"},
    ['I want to sleep when this program work fine', 'If it still has bug', {truth: "I'll sleep too"}],
    {a: {absoluteTruth: "Lack of sleep is detrimental to one's health,Then be more foolish"}}
]).then(res => {
    console.log(res)
})