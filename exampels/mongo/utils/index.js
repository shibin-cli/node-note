var Parameter = require('parameter')
var parameter = new Parameter()

module.exports = {
    validate(rules) {
        return (req, res, next) => {
            console.log(req.body, rules)

            const errors = parameter.validate(rules, req.body)
            if (!errors) {
                return next()
            }
            console.log(errors)
            res.status(422).json({
                errors,
                status: 0
            })
        }
    }
}