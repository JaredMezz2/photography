// Utility to catch async errors and pass them to our error handling.
// async function gets passed into this, executed, and if error is caught passed into next.
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}
